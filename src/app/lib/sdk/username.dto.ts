import { KeyValuePair } from "./contracts";

export class UsernameData {
	protected data: KeyValuePair;

	public constructor(data: KeyValuePair) {
		this.data = data;
	}

	public address(): string {
		return this.data.address;
	}

	public username(): string {
		return this.data.username;
	}

	public toObject(): KeyValuePair {
		return {
			address: this.address(),
			username: this.username(),
		};
	}

	public raw(): KeyValuePair {
		return this.data;
	}
}
