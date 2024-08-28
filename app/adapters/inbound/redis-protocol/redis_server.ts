import { createServer, type Server, type Socket } from "node:net";
import { parseInput } from "./parse/parsing";
import {
	createCommand,
	RedisType,
} from "../../../domain/entities/redis_element";
import { executeCommand } from "../../../domain/commands/execute";
import InMemoryDataStore from "../../outbound/in_memory/in_memory_data_store";
import type { DataStorePort } from "../../../application/ports/data_store_port";
import { encodeOutput } from "./encode/encoding";
import type { RedisConfigType } from "../../../domain/entities/config";

export default class RedisServer {
	private config: RedisConfigType;
	private port: number;
	private ip: string;
	private server: Server | null = null;
	private dataStore: DataStorePort = new InMemoryDataStore();
	private onData: ((data: Buffer) => void)[];

	constructor(config: RedisConfigType, ip = "127.0.0.1", port = 6379) {
		this.ip = ip;
		this.port = port;
		this.onData = [];
		this.config = config;
		this.dataStore.setConfig(config);
	}

	addDataListener(fn: (data: Buffer) => void) {
		this.onData.push(fn);
	}

	start() {
		this.server = createServer((connection: Socket) => {
			connection.on("data", async (data: Buffer) => {
				const input = parseInput(data);
				console.log(`Input: ${JSON.stringify(input)}`);
				if (input.isFailure()) {
					connection.write(`+${input}\r\n`);
					return;
				}

				const command = createCommand(input.get());
				console.log(`Command: ${JSON.stringify(command)}`);
				if (command.isFailure()) {
					connection.write(`+${command}\r\n`);
					return;
				}

				try {
					const result = await executeCommand(command.get(), this.dataStore);
					if (result.isFailure()) throw result;

					console.log(`Result: ${JSON.stringify(result)}`);

					const output = encodeOutput(result.get());

					connection.write(output);
				} catch (err) {
					console.log(
						encodeOutput({ type: RedisType.BulkString, value: null }),
					);
					connection.write(
						encodeOutput({ type: RedisType.BulkString, value: null }),
					);
					return;
				}
			});
		});

		this.server.listen(this.port, this.ip);
	}
}
