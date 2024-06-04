// Round-robin redirection.
export default class Redirector {
  #index = 0;
  readonly #redirects: string[];

  constructor(redirects: string[]) {
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