import express from "express";
import argparse from "argparse";
import {eratosthenes, getPrimes} from "@/test-algorithm";

interface Arguments {
  port: number;
}

const parser = new argparse.ArgumentParser();
parser.add_argument("-p", "--port", {
  required: true,
  dest: "port",
  type: Number,
});
const args: Arguments = parser.parse_args();

const app = express();
app.use(express.urlencoded({
  extended: true,
}));
app.use(express.json());
app.set("trust proxy", true);

let id = 0;

app.use("/", (req, res) => {
  req.on("error", (e) => {
    console.error(e);
  })
  try {
    const rid = id;
    id++;
    console.time(`Request ${rid}`);
    const sieve = getPrimes(10e6);
    res.json({
      data: {
        sieve: sieve.slice(0, 100),
      },
      host: req.hostname,
      reflect: req.body,
      ip: req.ip,
      protocol: req.protocol,
      hostPort: args.port,
      reqHeaders: req.headers
    });
    console.timeEnd(`Request ${rid}`);
  } catch (e) {
    console.error(e);
  }
});

const activeServer = app.listen(args.port, () => {
  console.log(`Successfully listened to port ${args.port}`);
});

function shutdown() {
  activeServer.close(() => {
    process.exit(0);
  });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

