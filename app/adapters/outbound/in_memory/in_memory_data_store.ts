import type { DataStorePort } from "../../../application/ports/data_store_port";
import {
	isExpirable,
	type DataStoreKey,
	type Item,
} from "../../../domain/entities/item";
import { failure, success, type Result } from "../../../utils/Result";

export default class InMemoryDataStore implements DataStorePort {
	private store = new Map<DataStoreKey, Item>();

	set(key: DataStoreKey, value: Item) {
		this.store.set(key, value);
		return Promise.resolve(success(value));
	}

	get(key: DataStoreKey, now: Date = new Date()) {
		const result = this.store.get(key);
		if (result === undefined) return Promise.reject(failure("Key not found"));

		if (isExpirable(result) && result.isExpired(now)) {
			console.log("Item is expired");
			return Promise.reject(failure("Item expired"));
		}
		return Promise.resolve(success(result));
	}

	del(key: DataStoreKey) {
		throw new Error("Method not implemented.");
	}
}
