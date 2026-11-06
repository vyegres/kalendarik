// voice clips and family photos (IndexedDB), both stay on the device

const STORES = ['clips', 'photos'];
export const DB = {
  _db: null,
  open() {
    if (this._db) return Promise.resolve(this._db);
    return new Promise((res, rej) => {
      const r = indexedDB.open('kalendarik', 2);
      r.onupgradeneeded = () => STORES.forEach(s => { if (!r.result.objectStoreNames.contains(s)) r.result.createObjectStore(s); });
      r.onsuccess = () => { this._db = r.result; res(this._db); };
      r.onerror = () => rej(r.error);
    });
  },
  async tx(mode, fn, store = 'clips') {
    const db = await this.open();
    return new Promise((res, rej) => {
      const t = db.transaction(store, mode), req = fn(t.objectStore(store));
      t.oncomplete = () => res(req && req.result);
      t.onerror = () => rej(t.error);
    });
  },
  get(k, store) { return this.tx('readonly', s => s.get(k), store); },
  put(k, v, store) { return this.tx('readwrite', s => s.put(v, k), store); },
  del(k, store) { return this.tx('readwrite', s => s.delete(k), store); },
  keys(store) { return this.tx('readonly', s => s.getAllKeys(), store); },
};
