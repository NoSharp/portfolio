export type Ok<T> = { value: T; ok: true };
export type Err<E extends BaseError> = { error: E; ok: false };
export type Result<T, E extends BaseError> = Ok<T> | Err<E>;

export type BaseError = {
	name: string;
};

export function Ok<T>(value: T): Ok<T> {
	return {
		value: value,
		ok: true,
	};
}

export function Err<T extends BaseError>(value: T): Err<T> {
	return {
		error: value,
		ok: false,
	};
}

export function exhaust(value: never) {}

export type AsyncResult<T, E extends BaseError> = Promise<Result<T, E>>;
