import { failure, type Result, success } from "../../utils/Result";
import type {
	Command,
	ConfigGetCommand,
	EchoCommand,
	GetCommand,
	PingCommand,
	SetCommand,
} from "../commands/commands";

export enum RedisType {
	SimpleString = "+",
	SimpleError = "-",
	Integer = ":",
	BulkString = "$",
	Array = "*",
	Null = "_",
	Boolean = "#",
	Double = ",",
	BigNumber = "(",
	BulkError = "!",
	VerbatimString = "=",
	Map = "%",
	Set = "~",
	Push = ">",
}

export interface RedisSimpleString {
	type: RedisType.SimpleString;
	value: string;
}

export interface RedisSimpleError {
	type: RedisType.SimpleError;
	value: string;
}

export interface RedisInteger {
	type: RedisType.Integer;
	value: number;
}

export interface RedisBulkString {
	type: RedisType.BulkString;
	value: string | null;
}

export interface RedisArray {
	type: RedisType.Array;
	value: (RedisElement | null)[]; // Arrays can contain multiple Input values or nulls
}

export interface RedisNull {
	type: RedisType.Null;
	value: null;
}

export interface RedisBoolean {
	type: RedisType.Boolean;
	value: boolean;
}

export interface RedisDouble {
	type: RedisType.Double;
	value: number;
}

export interface RedisBigNumber {
	type: RedisType.BigNumber;
	value: string; // Big numbers are often represented as strings
}

export interface RedisBulkError {
	type: RedisType.BulkError;
	value: string;
}

export interface RedisVerbatimString {
	type: RedisType.VerbatimString;
	value: string;
}

export interface RedisMap {
	type: RedisType.Map;
	value: Map<RedisElement, RedisElement>;
}

export interface RedisSet {
	type: RedisType.Set;
	value: Set<RedisElement>;
}

export interface RedisPush {
	type: RedisType.Push;
	value: (RedisElement | null)[];
}

export type RedisElement =
	| RedisSimpleString
	| RedisSimpleError
	| RedisInteger
	| RedisBulkString
	| RedisArray
	| RedisNull
	| RedisBoolean
	| RedisDouble
	| RedisBigNumber
	| RedisBulkError
	| RedisVerbatimString
	| RedisMap
	| RedisSet
	| RedisPush;

export function createCommand(input: RedisElement): Result<Command, string> {
	if (input.type !== RedisType.Array)
		return failure(
			"Parse error: Input expected to be array when creating command",
		);

	if (input.value.length === 0)
		return failure("Parse error: Input array empty when creating command");

	const name = input.value[0];

	if (
		name?.type !== RedisType.BulkString &&
		name?.type !== RedisType.SimpleString
	)
		return failure("Parse error: Input name is not of type string");

	if (name.value === null)
		return failure("Parse erro: Input name is a null string");

	switch (name.value.toUpperCase()) {
		case "PING":
			return createPingCommand(input);
		case "ECHO":
			return createEchoCommand(input);
		case "GET":
			return createGetCommand(input);
		case "SET":
			return createSetCommand(input);
		case "CONFIG":
			return createConfigCommand(input);
		default:
			return failure(
				`Parse error: Unknown command (${name.value.toUpperCase()})`,
			);
	}
}

function createPingCommand(_: RedisArray): Result<PingCommand, string> {
	return success({ name: "PING" });
}

function createEchoCommand(input: RedisArray): Result<EchoCommand, string> {
	if (input.value.length <= 1)
		return failure("Parse error: ECHO command needs another argument");

	{
		const toEcho = input.value[1];
		if (
			toEcho?.type !== RedisType.SimpleString &&
			toEcho?.type !== RedisType.BulkString
		)
			return failure(
				"Parse error: ECHO command needs the argument to be a string",
			);

		return success({ name: "ECHO", message: toEcho.value || "" });
	}
}

function createGetCommand(input: RedisArray): Result<GetCommand, string> {
	if (input.value.length <= 1)
		return failure("Parse error: GET command needs another argument");

	{
		const key = input.value[1];
		if (
			key?.type !== RedisType.SimpleString &&
			key?.type !== RedisType.BulkString
		)
			return failure(
				"Parse error: GET command needs the argument to be a string",
			);

		return success({ name: "GET", key: key.value || "", time: new Date() });
	}
}

function createSetCommand(input: RedisArray): Result<SetCommand, string> {
	if (input.value.length <= 2)
		return failure("Parse error: SET command needs 2 arguments");

	{
		const key = input.value[1];
		if (
			key?.type !== RedisType.SimpleString &&
			key?.type !== RedisType.BulkString
		)
			return failure("Parse error: SET command needs the key to be a string");

		const value = input.value[2];
		if (
			value?.type !== RedisType.SimpleString &&
			value?.type !== RedisType.BulkString
		)
			return failure("Parse error: GET command needs the value to be a string");

		let expiry = undefined;
		for (let i = 3; i < input.value.length; ++i) {
			const val = input.value[i];
			if (!val) continue;

			if (val.value === "px") {
				const next = input.value.at(i + 1);
				if (
					!next ||
					(next.type !== RedisType.BulkString &&
						next.type !== RedisType.SimpleString &&
						next.type !== RedisType.Integer)
				) {
					return failure(
						"Parse error: PX option specified, but expiry time is not provided correctly",
					);
				}

				++i;
				expiry = Number(next.value);
			}
		}

		return success({
			name: "SET",
			key: key.value || "",
			value: value.value || "",
			expiry: expiry,
		});
	}
}

function createConfigCommand(input: RedisArray): Result<Command, string> {
	if (input.value.length <= 2)
		return failure("Parse error: CONFIG command needs 2 arguments");

	{
		const type = input.value[1];
		if (
			type?.type !== RedisType.SimpleString &&
			type?.type !== RedisType.BulkString
		)
			return failure(
				"Parse error: CONFIG command needs the key to be a string",
			);

		switch (type.value) {
			case "GET":
				return createConfigGetCommand(input);

			default:
				return failure(`Parse error: Unknown CONFIG command ${type.value}`);
		}
	}
}

function createConfigGetCommand(
	input: RedisArray,
): Result<ConfigGetCommand, string> {
	if (input.value.length <= 2)
		return failure("Parse error: CONFIG GET command needs 3 arguments");

	{
		const keys: string[] = [];
		for (let i = 2; i < input.value.length; ++i) {
			const val = input.value[i];
			if (!val) continue;

			if (typeof val.value === "string") {
				keys.push(val.value);
			}
		}

		return success({
			name: "CONFIG GET",
			keys: keys,
		});
	}
}
