import {
	type RedisArray,
	type RedisBulkString,
	type RedisSimpleString,
	RedisType,
	type RedisElement,
} from "../../../../domain/entities/redis_element";
import { failure, type Result, success } from "../../../../utils/Result";

export function parseInput(data: Buffer): Result<RedisElement, string> {
	const s = data.toString();

	const result = parseUnknown(s.split("\r\n").filter((i) => i !== ""));

	console.log(`Parsed: ${JSON.stringify(result)}`);

	return result.map((r) => r.result);
}

type ParseResult<T> = Result<{ result: T; rest: string[] }, string>;

function parseUnknown(s: string[]): ParseResult<RedisElement> {
	console.log(`Parsing unknown: ${s}`);

	if (s.length === 0) return failure("Parse error: Empty input");

	const line = s[0];
	if (line.length === 0) return failure("Parse error: Empty first line");

	const first = line[0];
	let result: ParseResult<RedisElement>;
	switch (first) {
		case "+":
			result = parseSimpleString(s);
			break;
		case "$":
			result = parseBulkString(s);
			break;
		case "*":
			result = parseArray(s);
			break;

		default:
			result = failure(`Parse error: Unknown first character (${first})`);
	}

	return result;
}

function parseSimpleString(s: string[]): ParseResult<RedisSimpleString> {
	if (s.length === 0) return failure("Parsing error: No simple string found.");

	return success({
		result: { value: s[0], type: RedisType.SimpleString },
		rest: s.slice(1),
	});
}

function parseBulkString(s: string[]): ParseResult<RedisBulkString> {
	if (s.length < 2)
		return failure(
			`Parse error: Not enough lines to parse a bulk string (${s.length})`,
		);
	const line = s[1];

	return success({
		result: { value: line.trim(), type: RedisType.BulkString },
		rest: s.slice(2),
	});
}

function parseArray(s: string[]): ParseResult<RedisArray> {
	const length = Number.parseInt(s[0].slice(1));
	if (s.length - 1 < length)
		return failure(
			`Parse error: Not enough lines to parse in an array (Expected: ${length}, Got: ${s.length - 1})`,
		);

	let rest = s.slice(1);
	const result: RedisElement[] = [];
	for (let i = 0; i < length; ++i) {
		const item = parseUnknown(rest);
		if (item.isFailure()) return item;

		const r = item.get();
		rest = r.rest;
		result.push(r.result);
	}

	return success({
		result: { value: result, type: RedisType.Array },
		rest: s.slice(1),
	});
}
