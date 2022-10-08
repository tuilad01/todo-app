export class Idb {
    // indexed db name and version
    private _idbName = process.env.REACT_APP_INDEXEDDB_NAME || "myidb"
    private _idbVersion = process.env.REACT_APP_INDEXEDDB_VERSION ? +process.env.REACT_APP_INDEXEDDB_VERSION : 1
    // object stores
    protected _objectStoreNamesRegister: string[] = []

    protected _global_objectStore = ""


    public async connect() {
        let db: IDBDatabase | null = null
        const request = window.indexedDB.open(this._idbName, this._idbVersion)

        try {
            db = await new Promise((resolve, reject) => {
                request.onsuccess = (event: any) => resolve(event.target.result)
                request.onerror = reject
                request.onupgradeneeded = (event: any) => {
                    const database = event.target.result as IDBDatabase
                    const promisesObjectStoreTrans: Promise<IDBDatabase>[] = []

                    for (let i = 0; i < this._objectStoreNamesRegister.length; i++) {
                        const objectStoreNameRegister = this._objectStoreNamesRegister[i];

                        // create object store with a key index for all in version 1
                        if (this._idbVersion <= 1) {
                            const objectStore = database.createObjectStore(objectStoreNameRegister, { keyPath: "key", autoIncrement: true })

                            promisesObjectStoreTrans.push(new Promise<IDBDatabase>(resolve2 => {
                                objectStore.transaction.oncomplete = (event: any) => resolve2(event.target.result)
                            }))
                        }


                    }
                    // waiting for all object stores to be created
                    Promise.all(promisesObjectStoreTrans).then(values => resolve(values[values.length - 1]))
                }

            })

        } catch (error) {
            console.error(error)
        }

        return db
    }
    /*
        Public functions
    */

    public async findAll(query?: { [key: string]: any }) {
        let db: IDBDatabase | null = null
        let result: any[] = []

        try {
            db = await this.connect()

            if (db) {
                const transaction = db.transaction([this._global_objectStore], "readonly")
                const objectStore = transaction.objectStore(this._global_objectStore)

                if (query) {
                    result = await this.getAllByQuery(objectStore, query)
                } else {
                    result = await this.getAll(objectStore);
                }

            }
        } catch (error) {
            console.error(error)
        } finally {
            if (db) {
                db.close()
            }
        }

        return result
    }

    public async find(query: any): Promise<any> {
        let db: IDBDatabase | null = null
        let result: any = null

        try {
            db = await this.connect()

            if (db) {
                const transaction = db.transaction([this._global_objectStore], "readonly")
                const objectStore = transaction.objectStore(this._global_objectStore)

                result = await this.get(objectStore, query)
            }
        } catch (error) {
            console.error(error)
        } finally {
            if (db) {
                db.close()
            }
        }

        return result
    }

    public async add(object: any): Promise<any> {
        let result: any = null
        let db: IDBDatabase | null = null

        try {
            db = await this.connect()

            if (db) {
                const transaction = db.transaction([this._global_objectStore], "readwrite")
                const objectStore = transaction.objectStore(this._global_objectStore)
                const request = objectStore.add(object);

                const key = await new Promise<any>((resolve, reject) => {
                    request.onsuccess = (event: any) => resolve(event.target.result)
                    request.onerror = reject
                })

                if (key) {
                    object.key = key
                    result = object
                }
            }
        } catch (error) {
            console.error(error)
        } finally {
            if (db) {
                db.close()
            }
        }

        return result
    }

    public async update(query: object, object: { [key: string]: any }): Promise<any> {
        let db: IDBDatabase | null = null
        let result: any = null

        try {
            db = await this.connect()

            if (db) {
                const transaction = db.transaction([this._global_objectStore], "readwrite")
                const objectStore = transaction.objectStore(this._global_objectStore)

                const obj = await this.get(objectStore, query)

                if (obj && obj.key) {

                    for (const key in object) {
                        if (Object.prototype.hasOwnProperty.call(object, key)) {
                            //const element = object[key];
                            obj[key] = object[key]
                        }
                    }

                    const request = objectStore.put(obj)

                    const key = await new Promise<any>((resolve, reject) => {
                        request.onsuccess = (event: any) => resolve(event.target.result)
                        request.onerror = reject
                    })
                    if (key) {
                        result = obj
                    }

                }
            }
        } catch (error) {
            console.error(error)
        } finally {
            if (db) {
                db.close()
            }
        }

        return result
    }

    public async remove(query: object): Promise<number> {
        let db: IDBDatabase | null = null
        let result: number = 0

        try {
            db = await this.connect()

            if (db) {
                const transaction = db.transaction([this._global_objectStore], "readwrite")
                const objectStore = transaction.objectStore(this._global_objectStore)

                const obj = await this.get(objectStore, query)

                if (obj && obj.key) {
                    objectStore.delete(obj.key)

                    const key = await new Promise<any>((resolve, reject) => {
                        transaction.oncomplete = _ => resolve(obj.key)
                        transaction.onerror = reject
                    })

                    result = key
                }
            }
        } catch (error) {
            console.error(error)
        } finally {
            if (db) {
                db.close()
            }
        }

        return result
    }

    /*
        Private functions
     */

    private async getAllByQuery(objectStore: IDBObjectStore, query: { [key: string]: any }): Promise<any[]> {
        let result: any[] = []
        try {
            const list: any[] = []
            result = await new Promise<any[]>((resolve) => {
                objectStore.openCursor().onsuccess = (event: any) => {
                    const cursor = event.target.result;
                    //const object = Object.keys(queryTest)
                    if (cursor) {
                        for (const key in query) {
                            if (cursor.value[key] == query[key]) {
                                //resolve(cursor.value)
                                list.push(cursor.value)
                                // console.log("list:")
                                // console.log(list)
                                break;
                            }
                        }

                        cursor.continue();
                    } else {
                        resolve(list)
                    }
                };
            })
        } catch (error) {
            console.error(error)
        }

        return result;
    }

    private async getAll(objectStore: IDBObjectStore): Promise<any[]> {
        let result: any[] = []
        try {
            const request = objectStore.getAll();

            result = await new Promise<any[]>((resolve, reject) => {
                request.onsuccess = (event: any) => resolve(event.target.result)
                request.onerror = reject
            })
        } catch (error) {
            console.error(error)
        }

        return result
    }

    private async get(objectStore: IDBObjectStore, query: { [key: string]: any }): Promise<any> {
        let result: any = null
        try {
            result = await new Promise<any>((resolve) => {
                objectStore.openCursor().onsuccess = (event: any) => {
                    const cursor = event.target.result;
                    let continute = true;
                    if (cursor) {
                        for (const key in query) {
                            if (cursor.value[key] == query[key]) {
                                continute = false
                                resolve(cursor.value)
                            }
                        }
                        if (continute) {
                            cursor.continue();
                        }
                    } else {
                        resolve(null)
                    }
                };
            })
        } catch (error) {
            console.error(error)
        }

        return result;
    }
}