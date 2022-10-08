import { Idb } from "./idb";

export class Schema extends Idb {
    protected readonly _objectStoreNamesRegister: string[] = [
        // ============== Please register your object stores here... ==============
        "Group",
        "Todo"
    ]
}