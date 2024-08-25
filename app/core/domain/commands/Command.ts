import type { Result } from "../../../utils/Result";

export abstract class Command {
	name: string;
	args: string[];

	constructor(name: string, args: string[] = []) {
		this.name = name;
		this.args = args;
	}

	abstract run(): Result<string, string>;
}
