"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const argparse_1 = __importDefault(require("argparse"));
const load_config_1 = require("./helpers/load-config");
let $log = console.log;
console.log = function (...args) {
    $log.call(this, new Date(), ...args);
};
const parser = new argparse_1.default.ArgumentParser();
parser.add_argument("-c", "--config", {
    required: true,
    dest: "config",
    type: String,
});
const args = parser.parse_args();
const conf = (0, load_config_1.loadConfig)(args.config);
const server = http_1.default.createServer(async (req, res) => {
    const proxy = (await conf).proxy;
    await proxy.proxyRequest(req, res);
});
const PORT = 8000;
const activeServer = server.listen(PORT, () => {
    console.log(`Successfully listened to port ${PORT}`);
});
function shutdown() {
    activeServer.close(() => {
        process.exit(0);
    });
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
