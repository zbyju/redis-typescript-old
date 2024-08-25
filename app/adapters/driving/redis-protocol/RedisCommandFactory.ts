import type { Command } from "../../../core/domain/commands/Command";
import PingCommand from "../../../core/domain/commands/PingCommand";
import type CommandFactory from "../../../core/ports/driving/CommandFactory";
import { failure, success, type Result } from "../../../utils/Result";
import { RedisType, type RedisValue } from "./parse/RedisInput";

const RedisCommandFactory = {
	createCommand(input: RedisValue): Result<Command, string> {
		if (input.type !== RedisType.Array || input.value.length === 0) {
			return failure(
				`Parse error: can't parse redis value into a command ${JSON.stringify(input)}`,
			);
		}

		const name = input.value[0];

		if (
			name?.type !== RedisType.BulkString &&
			name?.type !== RedisType.SimpleString
		)
			return failure("Parse error: no name at first position");

		switch (name.value.toUpperCase()) {
			case "PING":
				return success(new PingCommand());

			default:
				return failure(`Parse error: unknown command name (${name.value})`);
		}
	},
};

export default RedisCommandFactory;
