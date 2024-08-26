import type { Result } from "../../../utils/Result";

export interface Command {
	name: string;

	run(): Result<string, string>;
}
