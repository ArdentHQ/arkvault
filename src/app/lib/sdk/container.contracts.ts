export type CradleKey = string | symbol;
export type CradleValue = any;

export type ConstantCradle = Map<CradleKey, CradleValue>;
export type InstanceCradle = Map<CradleKey, CradleValue>;

export interface IContainer {
	get<T>(key: CradleKey): T;

	constant(key: CradleKey, value: CradleValue): void;

	singleton(key: CradleKey, value: CradleValue): void;

	factory<T>(className: CradleValue): () => T;

	resolve<T>(className: CradleValue): T;

	has(key: CradleKey): boolean;

	missing(key: CradleKey): boolean;

	unbind(key: CradleKey): boolean;

	unbindAsync(key: CradleKey): Promise<boolean>;

	flush(): void;
}

export type Factory<T> = () => T;
