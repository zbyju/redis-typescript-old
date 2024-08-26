import { createServer, type Server, type Socket } from "node:net";
import { parseInput } from "./parse/parsing";
import RedisCommandFactory from "./RedisEntityFactory";
import { createCommand } from "../../../core/domain/entities/InputEntity";
import { failure } from "../../../utils/Result";

export default class RedisServer {
	private port: number;
	private ip: string;
	private server: Server | null = null;
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
			connection.on("data", (data: Buffer) => {
				const input = RedisCommandFactory.createInput(data);
				if (input.isFailure()) return failure(input);

				const command = createCommand(input.get());
				if (command.isFailure()) return failure(command);

				const result = command.get().run();
				if (result.isFailure()) return failure(result);

				connection.write(`+${result.get()}\r\n`);
			});
		});

		this.server.listen(this.port, this.ip);
	}
}
