import type {
	DataStoreKey,
	DataStoreValue,
} from "../../application/ports/data_store_port";

export type Command = PingCommand | EchoCommand | SetCommand | GetCommand;

export interface AbstractCommand {
	readonly name: string;
}
export interface PingCommand extends AbstractCommand {
	name: "PING";
}
export interface EchoCommand extends AbstractCommand {
	name: "ECHO";
	message: string;
}
export interface GetCommand extends AbstractCommand {
	name: "GET";
	key: DataStoreKey;
}
export interface SetCommand extends AbstractCommand {
	name: "SET";
	key: DataStoreKey;
	value: DataStoreValue;
}
