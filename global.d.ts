export {};

declare global {
	// TODO: remove when TS will be updated by https://github.com/microsoft/TypeScript/issues/44268
	interface String {
		toUpperCase<T extends string>(this: T): Uppercase<T>;

		toLowerCase<T extends string>(this: T): Lowercase<T>;
	}
}
