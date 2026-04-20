import { DataRepository } from "./data.repository";
import { TokenData } from "./token.contracts";
import { TokenDTO } from "./token.dto";

export class TokenRepository {
	readonly #data: DataRepository;

	public constructor() {
		this.#data = new DataRepository();
	}

	public fill(tokens: object): void {
		for (const [id, token] of Object.entries(tokens)) {
			this.#data.set(id, new TokenDTO(token));
		}
	}

	public all(): Record<string, TokenDTO> {
		return this.#data.all() as Record<string, TokenDTO>;
	}

	public first(): TokenDTO {
		return this.#data.first();
	}

	public last(): TokenDTO {
		return this.#data.last();
	}

	public keys(): string[] {
		return this.#data.keys();
	}

	public values(): TokenDTO[] {
		return this.#data.values();
	}

	public push(token: TokenDTO): void {
		this.#data.set(token.address(), token);
	}

	public create(data: TokenData): TokenDTO {
		const token = new TokenDTO(data);

		this.push(token);

		return token;
	}

	public has(id: string): boolean {
		return this.#data.has(id);
	}

	public forget(id: string): void {
		if (this.#data.missing(id)) {
			throw new Error(`No token found for [${id}].`);
		}

		this.#data.forget(id);
	}

	public flush(): void {
		this.#data.flush();
	}

	public count(): number {
		return this.#data.count();
	}
}
