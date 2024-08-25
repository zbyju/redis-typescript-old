import { parseInput } from "./parsing";

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
	value: string;
}

export interface RedisArray {
	type: RedisType.Array;
	value: (RedisValue | null)[]; // Arrays can contain multiple Redis values or nulls
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
	value: Map<RedisValue, RedisValue>;
}

export interface RedisSet {
	type: RedisType.Set;
	value: Set<RedisValue>;
}

export interface RedisPush {
	type: RedisType.Push;
	value: (RedisValue | null)[];
}

export type RedisValue =
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
