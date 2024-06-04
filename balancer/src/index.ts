import http from "http";
import https from "https";
import argparse from "argparse";
import {loadConfig} from "@/helpers/load-config";
import * as fs from "fs";

let $log = console.log;
console.log = function (...args) {
  $log.call(this, new Date(), ...args);
};

const parser = new argparse.ArgumentParser();
parser.add_argument("-c", "--config", {
  required: true,
  dest: "config",
  type: String,
});

interface Arguments {
  config: string,
}

const args: Arguments = parser.parse_args();

const confPromise = loadConfig(args.config);

async function requestHandler(req: http.IncomingMessage, res: http.ServerResponse) {
  const proxy = (await confPromise).proxy;
  await proxy.proxyRequest(req, res);
}

async function closeServer<T extends {
  close(cb: () => void): T
}>(server: T) {
  return await new Promise<T>(resolve => {
    server.close(() => {
      resolve(server);
    });
  })
}

async function startServers() {
  const conf = await confPromise;
  let httpServer: http.Server | undefined;
  let httpsServer: http.Server | undefined;

  if (conf.http) {
    const httpConf = conf.http;
    httpServer = http.createServer((req, res) => {
      req.protocol = "http";
      requestHandler(req, res)
    });
    httpServer.listen(httpConf.port, () => {
      console.log(`HTTP server listening to port ${httpConf.port}`);
    });
  }

  if (conf.https) {
    const httpsConf = conf.https;
    httpsServer = https.createServer({
      key: await fs.promises.readFile(httpsConf.key),
      cert: await fs.promises.readFile(httpsConf.cert),
    }, (req, res) => {
      req.protocol = "https";
      requestHandler(req, res)
    });
    httpsServer.listen(httpsConf.port, () => {
      console.log(`HTTPS server listening to port ${httpsConf.port}`);
    });
  }

  if (!httpServer && !httpsServer) {
    throw new Error("No HTTP/HTTPS config found.");
  }
  async function shutdown() {
    await Promise.all([
      httpsServer ? closeServer(httpsServer) : null,
      httpServer ? closeServer(httpServer) : null,
    ]);
    process.exit(0);
  }

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

startServers().then();