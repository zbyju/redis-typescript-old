import type { Result } from "../../utils/Result";
import type { RedisElement } from "../../domain/entities/redis_element";

export type DataStoreKey = string;
export type DataStoreValue = string;

export interface DataStorePort {
	set(
		key: DataStoreKey,
		value: DataStoreValue,
	): Promise<Result<DataStoreValue, string>>;

	get(key: DataStoreKey): Promise<Result<DataStoreValue, string>>;
}
