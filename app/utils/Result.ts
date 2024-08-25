export type Result<T, E> = Success<T> | Failure<E>;

class Success<T> {
	readonly _tag = "success" as const;
	constructor(private value: T) {}

	isSuccess(): this is Success<T> {
		return true;
	}

	isFailure(): this is Failure<never> {
		return false;
	}

	map<U>(f: (value: T) => U): Result<U, never> {
		return new Success(f(this.value));
	}

	getOr(_: T): T {
		return this.value;
	}

	get(): T {
		return this.value;
	}

	flatMap<U, E>(f: (value: T) => Result<U, E>): Result<U, E> {
		return f(this.value);
	}
}

class Failure<E> {
	readonly _tag = "failure" as const;
	constructor(private error: E) {}

	isSuccess(): this is Success<never> {
		return false;
	}

	isFailure(): this is Failure<E> {
		return true;
	}

	map<U>(_: (value: never) => U): Result<never, E> {
		return this;
	}

	getOr<T>(defaultValue: T): T {
		return defaultValue;
	}

	getError(): E {
		return this.error;
	}

	flatMap<U>(_: (value: never) => Result<U, E>): Result<never, E> {
		return this;
	}
}

// Helper functions to create Result instances
export function success<T>(value: T): Result<T, never> {
	return new Success(value);
}

export function failure<E>(error: E): Result<never, E> {
	return new Failure(error);
}
