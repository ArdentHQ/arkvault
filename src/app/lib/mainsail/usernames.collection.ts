import { UsernameData } from "./username.dto";

export class UsernameDataCollection {
	readonly #data: UsernameData[];

	public constructor(data: UsernameData[]) {
		this.#data = data;
	}

	public items(): UsernameData[] {
		return this.#data;
	}

	public findByAddress(address: string): UsernameData | undefined {
		return this.#find("address", address);
	}

	public findByUsername(username: string): UsernameData | undefined {
		return this.#find("username", username);
	}

	#find(key: string, value: string): UsernameData | undefined {
		return this.#data.find((item: UsernameData) => item[key]() === value);
	}

	public isEmpty(): boolean {
		return this.#data.length === 0;
	}

	public isNotEmpty(): boolean {
		return !this.isEmpty();
	}
}
