import { failure, type Result, success } from "../../../utils/Result";
import type { Command } from "../commands/Command";
import EchoCommand from "../commands/EchoCommand";
import PingCommand from "../commands/PingCommand";

export enum InputType {
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

export interface InputSimpleString {
	type: InputType.SimpleString;
	value: string;
}

export interface InputSimpleError {
	type: InputType.SimpleError;
	value: string;
}

export interface InputInteger {
	type: InputType.Integer;
	value: number;
}

export interface InputBulkString {
	type: InputType.BulkString;
	value: string;
}

export interface InputArray {
	type: InputType.Array;
	value: (InputValue | null)[]; // Arrays can contain multiple Input values or nulls
}

export interface InputNull {
	type: InputType.Null;
	value: null;
}

export interface InputBoolean {
	type: InputType.Boolean;
	value: boolean;
}

export interface InputDouble {
	type: InputType.Double;
	value: number;
}

export interface InputBigNumber {
	type: InputType.BigNumber;
	value: string; // Big numbers are often represented as strings
}

export interface InputBulkError {
	type: InputType.BulkError;
	value: string;
}

export interface InputVerbatimString {
	type: InputType.VerbatimString;
	value: string;
}

export interface InputMap {
	type: InputType.Map;
	value: Map<InputValue, InputValue>;
}

export interface InputSet {
	type: InputType.Set;
	value: Set<InputValue>;
}

export interface InputPush {
	type: InputType.Push;
	value: (InputValue | null)[];
}

export type InputValue =
	| InputSimpleString
	| InputSimpleError
	| InputInteger
	| InputBulkString
	| InputArray
	| InputNull
	| InputBoolean
	| InputDouble
	| InputBigNumber
	| InputBulkError
	| InputVerbatimString
	| InputMap
	| InputSet
	| InputPush;

export function createCommand(input: InputValue): Result<Command, string> {
	if (input.type !== InputType.Array)
		return failure(
			"Parse error: Input expected to be array when creating command",
		);

	if (input.value.length === 0)
		return failure("Parse error: Input array empty when creating command");

	const name = input.value[0];

	if (
		name?.type !== InputType.BulkString &&
		name?.type !== InputType.SimpleString
	)
		return failure("Parse error: Input name is not of type string");

	switch (name.value.toUpperCase()) {
		case "PING":
			return success(new PingCommand());
		case "ECHO":
			if (input.value.length <= 1)
				return failure("Parse error: ECHO command needs another argument");

			{
				const toEcho = input.value[1];
				if (
					toEcho?.type !== InputType.SimpleString &&
					toEcho?.type !== InputType.BulkString
				)
					return failure(
						"Parse error: ECHO command needs the argument to be a string",
					);

				return success(new EchoCommand(toEcho?.value || ""));
			}

		default:
			return failure(
				`Parse error: Unknown command (${name.value.toUpperCase()})`,
			);
	}
}
