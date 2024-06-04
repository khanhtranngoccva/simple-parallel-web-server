class BitVector {
  #impl;

  constructor(length: number) {
    this.#impl = new Uint32Array(Math.ceil(length / 32));
  }

  setAll(value: boolean|number) {
    if (value) {
      this.#impl.fill(4294967295);
    } else {
      this.#impl.fill(0)
    }
  }

  get length() {
    return this.#impl.length * 32
  }

  get(index: number) {
    return (this.#impl[index >> 5] >> index & 31) & 1;
  }

  set(index: number, newValue: number|boolean) {
    let implIndex = index >> 5;
    let implOffset = index & 31;
    let clearImpl = ~(1 << implOffset);
    let newImpl = +!!newValue << implOffset;
    this.#impl[implIndex] &= clearImpl;
    this.#impl[implIndex] |= newImpl;
  }

  debug(start=0, end=this.#impl.length) {
    const out = [...this.#impl.slice(start, end)].map(i => [...i.toString(2).padStart(32, '0')]);
    for (let i = start; i < end; i++) {
      const line = out[i].reverse().join("");
    }
  }
}

export function eratosthenes(size: number) {
  const sieve = new BitVector(size);
  sieve.setAll(1);
  sieve.set(0, 0);
  sieve.set(1, 0);
  const root = Math.sqrt(size);
  for (let i = 3; i <= root; i += 2) {
    if (sieve.get(i)) {
      for (let j = i << 1; j < sieve.length; j += i) {
        sieve.set(j, false);
      }
    }
  }
  return sieve;
}

export function getPrimes(max: number) {
  const res = [];
  const sieve = eratosthenes(3e6);
  res.push(2);
  for (let j = 3; j < 5e8; j += 2) {
    if (sieve.get(j)) {
      res.push(j);
    }
  }
  return res;
}