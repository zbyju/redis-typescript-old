import type { Result } from "../../../utils/Result";
import type { Command } from "../../domain/commands/Command";

export default interface CommandFactory {
	createCommand(input: unknown): Result<Command, string>;
}
