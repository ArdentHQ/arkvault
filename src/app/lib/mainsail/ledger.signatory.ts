/* istanbul ignore file */

import { IdentityOptions } from "@/app/lib/mainsail/shared.contract";

export class LedgerSignatory {
	readonly #signingKey: string;
	readonly #options?: IdentityOptions;

	public constructor({ signingKey, options }: { signingKey: string; options?: IdentityOptions }) {
		this.#signingKey = signingKey;
		this.#options = options;
	}

	public signingKey(): string {
		return this.#signingKey;
	}

	public options(): IdentityOptions | undefined {
		return this.#options;
	}
}
