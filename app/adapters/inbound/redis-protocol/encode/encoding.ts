import {
	type RedisBulkString,
	RedisType,
	type RedisElement,
	type RedisSimpleString,
	type RedisArray,
} from "../../../../domain/entities/redis_element";

export function encodeOutput(output: RedisElement | null): string {
	if (output === null) {
		return "$-1\r\n";
	}

	switch (output.type) {
		case RedisType.SimpleString:
			return encodeSimpleString(output);
		case RedisType.BulkString:
			return encodeBulkString(output);
		case RedisType.Array:
			return encodeArray(output);

		default:
			return encodeSimpleString({
				type: RedisType.SimpleString,
				value: "Encoding error",
			});
	}
}

export function encodeSimpleString(str: RedisSimpleString): string {
	return `+${str.value}\r\n`;
}

export function encodeBulkString(str: RedisBulkString): string {
	if (str.value === null) return "$-1\r\n";
	return `$${str.value.length}\r\n${str.value}\r\n`;
}

export function encodeArray(arr: RedisArray): string {
	const inside = arr.value.map((x) => encodeOutput(x)).join("");
	return `*${arr.value.length}\r\n${inside}`;
}
