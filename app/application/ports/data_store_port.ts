import type { Result } from "../../utils/Result";
import type {
	DataStoreKey,
	DataStoreValue,
	Item,
} from "../../domain/entities/item";
import type { RedisArray } from "../../domain/entities/redis_element";
import type { RedisConfigType } from "../../domain/entities/config";

export interface DataStorePort {
	set(key: DataStoreKey, value: Item): Promise<Result<Item, string>>;

	get(key: DataStoreKey, now: Date): Promise<Result<Item, string>>;

	setConfig(config: RedisConfigType): void;
	getConfigKeys(keys: string[]): Result<string[], string>;
}
