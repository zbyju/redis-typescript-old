import type { Result } from "../../utils/Result";
import type {
	DataStoreKey,
	DataStoreValue,
	Item,
} from "../../domain/entities/item";

export interface DataStorePort {
	set(key: DataStoreKey, value: Item): Promise<Result<Item, string>>;

	get(key: DataStoreKey, now: Date): Promise<Result<Item, string>>;
}
