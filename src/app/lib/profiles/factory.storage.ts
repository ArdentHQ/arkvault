import { Storage } from "./environment.models.js";
import { LocalStorage } from "./local.storage";
import { MemoryStorage } from "./memory.storage";
import { NullStorage } from "./null.storage";

export class StorageFactory {
	public static make(driver: string): Storage {
		return {
			indexeddb: () => new LocalStorage("indexeddb"),
			localstorage: () => new LocalStorage("localstorage"),
			memory: () => new MemoryStorage(),
			null: () => new NullStorage(),
			websql: () => new LocalStorage("websql"),
		}[driver]!();
	}
}
