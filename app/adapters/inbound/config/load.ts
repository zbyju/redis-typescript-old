import type { RedisConfigType } from "../../../domain/entities/config";

export default function loadConfig(): RedisConfigType {
	const obj: RedisConfigType = {
		dir: "",
		dbfilename: "",
	};
	const args = process.argv.slice(2);
	for (let i = 0; i < args.length; ++i) {
		const key = args[i];
		if (
			key.slice(0, 2) !== "--" ||
			!(key.slice(2) in obj) ||
			i + 1 >= args.length
		)
			continue;

		const value = args[i + 1];
		obj[key.slice(2) as keyof RedisConfigType] = value;
	}
	return obj;
}
