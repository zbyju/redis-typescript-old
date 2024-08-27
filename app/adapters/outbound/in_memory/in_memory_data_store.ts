import type {
	DataStoreKey,
	DataStorePort,
	DataStoreValue,
} from "../../../application/ports/data_store_port";
import { RedisType } from "../../../domain/entities/redis_element";
import { failure, success, type Result } from "../../../utils/Result";

export default class InMemoryDataStore implements DataStorePort {
	private store = new Map<DataStoreKey, DataStoreValue>();

	set(key: DataStoreKey, value: DataStoreValue) {
		this.store.set(key, value);
		return Promise.resolve(success(value));
	}
	get(key: DataStoreKey) {
		const result = this.store.get(key);
		if (result === undefined) return Promise.reject(failure("Key not found"));

		return Promise.resolve(success(result));
	}
	del(key: DataStoreKey) {
		throw new Error("Method not implemented.");
	}
}
