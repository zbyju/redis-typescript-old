import { failure, success, type Result } from "../../../utils/Result";
import { Command } from "./Command";

export default class PingCommand extends Command {
	constructor() {
		super("PING");
	}

	run(): Result<string, string> {
		return success("PONG");
	}
}
