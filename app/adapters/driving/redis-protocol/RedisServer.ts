import { createServer, type Server, type Socket } from "node:net";
import { parseInput } from "./parse/parsing";
import RedisCommandFactory from "./RedisCommandFactory";

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
				const parsed = parseInput(data);
				if (parsed.isFailure()) return;

				const command = RedisCommandFactory.createCommand(parsed.get());
				if (command.isFailure()) return;

				const result = command.get().run();
				if (result.isFailure()) return;

				connection.write(`+${result.get()}\r\n`);
			});
		});

		this.server.listen(this.port, this.ip);
	}
}
