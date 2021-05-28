export class DefaultMap<K, V> {
  private cache = new Map<K, V>()

  constructor(private getValue: (key: K) => V) {}

  get(key: K) {
    if (!this.cache.has(key)) {
      this.cache.set(key, this.getValue(key))
    }
    return this.cache.get(key)!
  }

  set(key: K, value: V) {
    this.cache.set(key, value)
  }

  has(key: K) {
    return this.cache.has(key)
  }
}
