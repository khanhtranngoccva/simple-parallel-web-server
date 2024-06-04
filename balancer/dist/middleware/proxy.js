"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = __importDefault(require("request"));
const NO_BODY_METHOD = new Set(["get", "head"]);
class Proxy {
    #redirector;
    constructor(redirector) {
        this.#redirector = redirector;
    }
    async proxyRequest(req, res) {
        // Convert request body event handler to a stream.
        const url = new URL(req.url, this.#redirector.next());
        const rid = crypto.randomUUID();
        console.log(`Request ${rid} started.`);
        console.time(rid);
        // {
        //
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
        //   console.timeEnd(rid);
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
        //
        // }
        req.pipe((0, request_1.default)({
            url: url.toString()
        })).pipe(res).on("finish", () => {
            console.timeEnd(rid);
        });
    }
}
exports.default = Proxy;
