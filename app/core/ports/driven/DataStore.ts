import type Item from "../../domain/entities/Item";
import type { Result } from "../../../utils/Result";

export interface DataStore {
	set(item: Item): Promise<Result<string, string>>;
	get(key: string): Promise<Result<string, string>>;
	del(key: string): Promise<Result<string, string>>;
}
