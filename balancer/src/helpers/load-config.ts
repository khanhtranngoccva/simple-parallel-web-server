import Redirector from "@/helpers/redirector";
import Proxy from "@/middlewares/proxy";
import * as path from "path";
import {z} from "zod";
import * as fs from "fs";

interface Config {
  redirect: string[],
  http?: {
    port: number,
  },
  https?: {
    port: number,
    key: string,
    cert: string,
  }
}

export async function loadConfig(confPath: string) {
  const configPath = path.join(process.cwd(), confPath);
  const url = path.join("file://", configPath);
  const config: Config = (await import(url)).default;

  // Load root config dir
  const rootConfigDir = path.parse(configPath).dir;

  // Load redirector
  const redirector = new Redirector(structuredClone(z.array(z.string()).min(1).parse(config.redirect)));
  const proxy = new Proxy(redirector);

  // Verify http and https object.
  const http = structuredClone(z.object({
    port: z.number()
  }).optional().parse(config.http));

  const https = structuredClone(z.object({
    port: z.number(),
    key: z.string(),
    cert: z.string(),
  }).optional().parse(config.https));

  if (https) {
    https.key = path.resolve(rootConfigDir, https.key);
    https.cert = path.resolve(rootConfigDir, https.cert);
    await fs.promises.readFile(https.key);
    await fs.promises.readFile(https.cert);
  }

  proxy.setConcurrencyLogging(true);

  console.log("Configuration loaded.");
  return {
    proxy,
    http: http,
    https: https
  }
}