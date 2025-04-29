import { ConstantCradle, CradleKey, CradleValue, Factory, IContainer, InstanceCradle } from "./container.contracts.js";

export class Container implements IContainer {
	#constants: ConstantCradle = new Map();
	#instances: InstanceCradle = new Map();

	public get<T>(key: CradleKey): T {
		return this.#get(key);
	}

	public constant(key: CradleKey, value: CradleValue): void {
		if (this.#constants.has(key)) {
			throw new Error(`[CONSTANT] Duplicate binding attempted for ${key.toString()}`);
		}

		this.#constants.set(key, value);
	}

	public singleton(key: CradleKey, className: CradleValue): void {
		if (this.#instances.has(key)) {
			throw new Error(`[INSTANCE] Duplicate binding attempted for ${key.toString()}`);
		}

		this.#instances.set(key, new className(this));
	}

	public factory<T>(className: CradleValue): Factory<T> {
		return () => new className(this);
	}

	public resolve<T>(className: CradleValue): T {
		return new className(this);
	}

	public has(key: CradleKey): boolean {
		return this.#has(key);
	}

	public missing(key: CradleKey): boolean {
		return !this.has(key);
	}

	public unbind(key: CradleKey): boolean {
		const binding: any = this.get(key);

		if (binding && typeof binding.onPreDestruct === "function") {
			binding.onPreDestruct(this);
		}

		return this.#delete(key);
	}

	public async unbindAsync(key: CradleKey): Promise<boolean> {
		const binding: any = this.get(key);

		if (binding && typeof binding.onPreDestruct === "function") {
			await binding.onPreDestruct(this);
		}

		return this.#delete(key);
	}

	public flush(): void {
		this.#constants = new Map();
		this.#instances = new Map();
	}

	#get<T>(key: CradleKey): T {
		if (this.#constants.get(key)) {
			return this.#constants.get(key);
		}

		if (this.#instances.get(key)) {
			return this.#instances.get(key);
		}

		throw new Error(`No matching bindings found for ${key.toString()}`);
	}

	#has(key: CradleKey): boolean {
		if (this.#constants.has(key)) {
			return true;
		}

		if (this.#instances.has(key)) {
			return true;
		}

		return false;
	}

	#delete(key: CradleKey): boolean {
		if (this.#constants.delete(key)) {
			return true;
		}

		if (this.#instances.delete(key)) {
			return true;
		}

		return false;
	}
}
