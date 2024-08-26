import type CommandFactory from "../../../core/ports/driving/CommandFactory";
import { parseInput } from "./parse/parsing";

const RedisCommandFactory: CommandFactory = {
	createInput(input: Buffer) {
		return parseInput(input);
	},
};

export default RedisCommandFactory;
