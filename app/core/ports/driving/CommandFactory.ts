import type { Result } from "../../../utils/Result";
import type { InputValue } from "../../domain/entities/InputEntity";

export default interface EntityFactory {
	createInput(input: Buffer): Result<InputValue, string>;
}
