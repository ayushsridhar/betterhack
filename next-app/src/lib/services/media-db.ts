import type { AnyMedia } from "../types"

const DB_NAME = "database"
const DB_VERSION = 3
const STORE_NAME = "files"

export function openDB(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined")
    return Promise.reject(
      new Error("indexedDB is unavailable (SSR/Node environment)")
    )

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "hash" })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function addFile(media: AnyMedia): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    let tx: IDBTransaction
    try {
      tx = db.transaction(STORE_NAME, "readwrite")
      const store = tx.objectStore(STORE_NAME)
      store.put(media)
    } catch (err) {
      db.close()
      reject(err)
      return
    }
    tx.oncomplete = () => {
      db.close()
      resolve()
    }
    tx.onabort = () => {
      db.close()
      reject(tx.error)
    }
    tx.onerror = () => {
      db.close()
      reject(tx.error)
    }
  })
}

export async function getFile(hash: string): Promise<AnyMedia | undefined> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly")
    const store = tx.objectStore(STORE_NAME)
    const request = store.get(hash)
    let result: AnyMedia | undefined
    request.onsuccess = () => {
      result = request.result as AnyMedia | undefined
    }
    tx.oncomplete = () => {
      db.close()
      resolve(result)
    }
    tx.onabort = () => {
      db.close()
      reject(tx.error)
    }
    tx.onerror = () => {
      db.close()
      reject(tx.error)
    }
  })
}

export async function getAllFiles(): Promise<AnyMedia[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly")
    const store = tx.objectStore(STORE_NAME)
    const request = store.getAll()
    let result: AnyMedia[] = []
    request.onsuccess = () => {
      result = request.result as AnyMedia[]
    }
    tx.oncomplete = () => {
      db.close()
      resolve(result)
    }
    tx.onabort = () => {
      db.close()
      reject(tx.error)
    }
    tx.onerror = () => {
      db.close()
      reject(tx.error)
    }
  })
}

export async function deleteFile(hash: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    const store = tx.objectStore(STORE_NAME)
    store.delete(hash)
    tx.oncomplete = () => {
      db.close()
      resolve()
    }
    tx.onabort = () => {
      db.close()
      reject(tx.error)
    }
    tx.onerror = () => {
      db.close()
      reject(tx.error)
    }
  })
}

export async function countByHash(hash: string): Promise<number> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly")
    const store = tx.objectStore(STORE_NAME)
    const request = store.count(hash)
    let result = 0
    request.onsuccess = () => {
      result = request.result
    }
    tx.oncomplete = () => {
      db.close()
      resolve(result)
    }
    tx.onabort = () => {
      db.close()
      reject(tx.error)
    }
    tx.onerror = () => {
      db.close()
      reject(tx.error)
    }
  })
}
