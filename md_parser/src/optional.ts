export type Some<T> = { value: T; some: true };
export type None = { some: false};
export type Option<T> = None | Some<T>;

export function Some<T>(value: T): Some<T> {
	return {
		value: value,
		some: true,
	};
}

export function None(): None {
	return {
		some: false,
	};
}
