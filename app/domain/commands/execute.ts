import type { DataStorePort } from "../../application/ports/data_store_port";
import { failure, type Result, success } from "../../utils/Result";
import { BasicItem, ExpirableItem } from "../entities/item";
import { type RedisElement, RedisType } from "../entities/redis_element";
import type {
	Command,
	ConfigGetCommand,
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

		case "CONFIG GET":
			return executeConfigGetCommand(command, dataStore);

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
	const result = await dataStore.get(cmd.key, cmd.time);

	if (result.isFailure())
		return Promise.reject({ type: RedisType.BulkString, value: null });

	return success({ type: RedisType.BulkString, value: result.get().value });
}

async function executeSetCommand(
	cmd: SetCommand,
	dataStore: DataStorePort,
): CommandExecutionReturn {
	const baseItem = new BasicItem(cmd.value);
	const item =
		cmd.expiry !== undefined
			? new ExpirableItem(baseItem, cmd.expiry)
			: baseItem;
	const result = await dataStore.set(cmd.key, item);

	if (result.isFailure()) Promise.reject(result);
	return success({ type: RedisType.SimpleString, value: "OK" });
}

async function executeConfigGetCommand(
	cmd: ConfigGetCommand,
	dataStore: DataStorePort,
): CommandExecutionReturn {
	const result = dataStore.getConfigKeys(cmd.keys);

	if (result.isFailure())
		return Promise.reject({ type: RedisType.BulkString, value: null });

	return success(result.get());
}
