import { createServer, type Server, type Socket } from "node:net";
import { parseInput } from "./parse/parsing";
import { createCommand } from "../../../domain/entities/redis_element";
import { executeCommand } from "../../../domain/commands/execute";
import InMemoryDataStore from "../../outbound/in_memory/in_memory_data_store";
import type { DataStorePort } from "../../../application/ports/data_store_port";
import { encodeOutput } from "./encode/encoding";

export default class RedisServer {
	private port: number;
	private ip: string;
	private server: Server | null = null;
	private dataStore: DataStorePort = new InMemoryDataStore();
	private onData: ((data: Buffer) => void)[];

	constructor(ip = "127.0.0.1", port = 6379) {
		this.ip = ip;
		this.port = port;
		this.onData = [];
	}

	addDataListener(fn: (data: Buffer) => void) {
		this.onData.push(fn);
	}

	start() {
		this.server = createServer((connection: Socket) => {
			connection.on("data", async (data: Buffer) => {
				const input = parseInput(data);
				if (input.isFailure()) {
					connection.write(`+${input}\r\n`);
					return;
				}

				const command = createCommand(input.get());
				if (command.isFailure()) {
					connection.write(`+${command}\r\n`);
					return;
				}

				const result = await executeCommand(command.get(), this.dataStore);
				console.log(`Result: ${JSON.stringify(result)}`);
				if (result.isFailure()) {
					connection.write(`+${result}\r\n`);
					return;
				}

				const output = encodeOutput(result.get());

				connection.write(output);
			});
		});

		this.server.listen(this.port, this.ip);
	}
}
