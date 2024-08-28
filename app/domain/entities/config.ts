export interface RedisConfigType {
	dir: string;
	dbfilename: string;
}

export default class RedisConfig {
	private static _instance: RedisConfigType | undefined;

	private constructor() {}

	static get instance(): RedisConfigType {
		if (RedisConfig._instance === undefined) {
			RedisConfig._instance = {
				dir: "dir",
				dbfilename: "/tmp/redis-data",
			};
		}
		return RedisConfig._instance;
	}

	static setValues(
		values: { key: keyof RedisConfigType; value: string }[],
	): RedisConfigType {
		for (const { key, value } of values) {
			RedisConfig.instance[key] = value;
		}
		return RedisConfig.instance;
	}
}
