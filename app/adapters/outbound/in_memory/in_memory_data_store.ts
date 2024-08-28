import type { DataStorePort } from "../../../application/ports/data_store_port";
import RedisConfig, {
	type RedisConfigType,
} from "../../../domain/entities/config";
import {
	isExpirable,
	type DataStoreKey,
	type Item,
} from "../../../domain/entities/item";
import {
	RedisType,
	type RedisArray,
} from "../../../domain/entities/redis_element";
import { failure, success, type Result } from "../../../utils/Result";

export default class InMemoryDataStore implements DataStorePort {
	private config = RedisConfig.instance;
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

	setConfig(config: RedisConfigType): void {
		this.config = config;
	}

	getConfigKeys(keys: string[]): Result<RedisArray, string> {
		const result: RedisArray = { type: RedisType.Array, value: [] };
		for (const key of keys) {
			if (!(key in this.config)) {
				return failure(`${key} is not found in config`);
			}
			const value = this.config[key as keyof typeof this.config];
			result.value.push({ type: RedisType.BulkString, value: key });
			result.value.push({ type: RedisType.BulkString, value: value });
		}
		return success(result);
	}

	del(key: DataStoreKey) {
		throw new Error("Method not implemented.");
	}
}
