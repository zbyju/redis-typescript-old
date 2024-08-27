import type { DataStorePort } from "../../application/ports/data_store_port";
import { failure, type Result, success } from "../../utils/Result";
import { type RedisElement, RedisType } from "../entities/redis_element";
import type {
	Command,
	EchoCommand,
	GetCommand,
	PingCommand,
	SetCommand,
} from "./commands";

export type CommandExecutionReturn = Promise<Result<RedisElement, string>>;

export function executeCommand(
	command: Command,
	dataStore: DataStorePort,
): CommandExecutionReturn {
	switch (command.name) {
		case "PING":
			return executePingCommand(command);

		case "ECHO":
			return executeEchoCommand(command);

		case "GET":
			return executeGetCommand(command, dataStore);

		case "SET":
			return executeSetCommand(command, dataStore);

		default:
			return Promise.reject(failure("Unknown command"));
	}
}

async function executePingCommand(cmd: PingCommand): CommandExecutionReturn {
	return success({ type: RedisType.SimpleString, value: "PONG" });
}

async function executeEchoCommand(cmd: EchoCommand): CommandExecutionReturn {
	return success({ type: RedisType.SimpleString, value: cmd.message });
}

async function executeGetCommand(
	cmd: GetCommand,
	dataStore: DataStorePort,
): CommandExecutionReturn {
	const result = await dataStore.get(cmd.key);
	console.log(`GET response: ${JSON.stringify(result)}`);
	if (result.isFailure())
		return Promise.reject({ type: RedisType.BulkString, value: null });
	return success({ type: RedisType.BulkString, value: result.get() });
}

async function executeSetCommand(
	cmd: SetCommand,
	dataStore: DataStorePort,
): CommandExecutionReturn {
	const result = await dataStore.set(cmd.key, cmd.value);
	if (result.isFailure()) Promise.reject(result);
	return success({ type: RedisType.SimpleString, value: "OK" });
}
