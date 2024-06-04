export default class Counter<T> extends Map<T, number> {
  constructor(iterable?: Iterable<T>) {
    super()
    if (iterable) {
      for (let item of iterable) {
        this.inc(item);
      }
    }
  }

  get(item: T): number {
    return super.get(item) ?? 0;
  }

  set(item: T, count: number) {
    if (!Number.isInteger(count) || count < 0) {
      throw new Error(`Value ${count} is not a valid count value.`);
    }
    super.set(item, count);
    return this;
  }

  inc(item: T) {
    this.set(item, this.get(item) + 1);
  }

  dec(item: T) {
    this.set(item, this.get(item) - 1);
  }
}