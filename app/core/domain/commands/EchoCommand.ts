import { success, type Result } from "../../../utils/Result";
import type { Command } from "./Command";

export default class EchoCommand implements Command {
	readonly name: string;
	toEcho: string;
	constructor(str: string) {
		this.name = "PING";
		this.toEcho = str;
	}

	run(): Result<string, string> {
		return success(this.toEcho);
	}
}
