"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Round-robin redirection.
class Redirector {
    #index = 0;
    #redirects;
    constructor(redirects) {
        if (redirects.length < 0) {
            throw new Error("No redirect URLs in configuration.");
        }
        this.#redirects = [...redirects];
    }
    next() {
        this.#index += 1;
        this.#index %= this.#redirects.length;
        return this.#redirects[this.#index];
    }
}
exports.default = Redirector;
