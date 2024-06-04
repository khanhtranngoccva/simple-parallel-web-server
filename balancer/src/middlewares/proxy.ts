import http from "http";
import Redirector from "@/helpers/redirector";
import Counter from "@/helpers/counter";
import request from "request";

const NO_BODY_METHOD = new Set(["get", "head"]);

export default class Proxy {
  #redirector: Redirector;
  #counter = new Counter<string>();
  #lastConcurrency: number[] = [0];
  #concurrencyLoggingInterval: NodeJS.Timeout | number | null = null;

  constructor(redirector: Redirector) {
    this.#redirector = redirector;
  }

  setConcurrencyLogging(enabled: boolean) {
    if (!enabled && this.#concurrencyLoggingInterval) {
      clearInterval(this.#concurrencyLoggingInterval);
      return;
    } else if (enabled && !this.#concurrencyLoggingInterval) {
      this.#concurrencyLoggingInterval = setInterval(() => {
        console.log(`Concurrency is ${Math.max(...this.#lastConcurrency)}`);
        this.updateConcurrency();
      }, 1000);
    }
  }

  updateConcurrency() {
    const current = [...this.#counter.values()].filter(x => x > 0).length;
    this.#lastConcurrency.unshift(current);
    const MAX = 5;
    if (this.#lastConcurrency.length > MAX) {
      this.#lastConcurrency.length = MAX;
    }
  }

  async proxyRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    const upstream = this.#redirector.next();

    this.#counter.inc(upstream);
    this.updateConcurrency();

    // Convert request body event handler to a stream.
    const url = new URL(req.url!, upstream);
    // try {
    //   const proxyResponse = await fetch(url, {
    //     method: req.method,
    //     headers: {
    //       ...req.headers,
    //       "X-Forwarded-For": req.socket.remoteAddress,
    //     } as unknown as HeadersInit,
    //     // @ts-ignore this property does not exist in the standard API, but supported in NodeJS fetch.
    //     duplex: "half",
    //     // @ts-ignore can use the req object directly
    //     body: NO_BODY_METHOD.has(req.method?.toLowerCase() ?? "") ? undefined : req
    //   });
    //
    //   // Mirror proxy response's headers.
    //   const resHeaders = Object.fromEntries(proxyResponse.headers.entries());
    //   res.writeHead(
    //     proxyResponse.status,
    //     proxyResponse.statusText,
    //     resHeaders
    //   );
    //
    //   // If there's a body in the response, extract the stream and write to client.
    //   let readResult: ReadableStreamReadResult<Uint8Array>;
    //   if (proxyResponse.body) {
    //     const reader = proxyResponse.body?.getReader();
    //     do {
    //       readResult = await reader.read();
    //       if (readResult.value) {
    //         res.write(readResult.value);
    //       }
    //     } while (!readResult.done);
    //   }
    //
    //   // End HTTP response.
    //   res.end();
    // } catch (e) {
    //   console.error(e);
    //   console.log(upstream); 
    //   res.writeHead(500);
    //   res.end();
    // } finally {
    //   try {
    //     this.#counter.dec(upstream);
    //   } catch (e) {}
    //   this.updateConcurrency();
    // }

    req.on("close", () => {
      this.#counter.dec(upstream);
      this.updateConcurrency();
    });

    req.on("error", (e) => {
      console.error(e);
      res.writeHead(500);
      res.end();
    });

    const proxyReq = request({
      url: url.toString(),
      headers: {
        "X-Forwarded-For": req.socket.remoteAddress,
        "X-Forwarded-Host": req.headers.host,
        "X-Forwarded-Proto": req.protocol
      }
    });

    proxyReq.on("error", (e) => {
      console.error("Proxy error", e);
      res.writeHead(500);
      res.end();
    });

    req.pipe(proxyReq).pipe(res);
  }
}
