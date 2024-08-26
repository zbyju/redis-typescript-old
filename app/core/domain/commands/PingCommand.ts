import { success, type Result } from "../../../utils/Result";
import type { Command } from "./Command";

export default class PingCommand implements Command {
	readonly name: string;
	constructor() {
		this.name = "PING";
	}

	run(): Result<string, string> {
		return success("PONG");
	}
}
