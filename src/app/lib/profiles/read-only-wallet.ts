import { IReadOnlyWallet } from "./contracts.js";
import { Avatar } from "./helpers/avatar.js";
import { Contracts } from "./index.js";

export interface ROWallet {
	address: string;
	publicKey?: string;
	username?: string;
	rank?: number;
	explorerLink: string;
	isValidator: boolean;
	isResignedValidator: boolean;
	isLegacyValidator: boolean;
	governanceIdentifier: string;
}

export class ReadOnlyWallet implements IReadOnlyWallet {
	readonly #wallet: ROWallet;
	readonly #profile: Contracts.IProfile;

	public constructor(wallet: ROWallet, profile: Contracts.IProfile) {
		this.#wallet = wallet;
		this.#profile = profile;
	}

	/** {@inheritDoc IReadOnlyWallet.address} */
	public address(): string {
		return this.#wallet.address;
	}

	/** {@inheritDoc IReadOnlyWallet.alias} */
	public alias(): string | undefined {
		return this.#profile.findAliasByAddress(this.address());
	}

	/** {@inheritDoc IReadOnlyWallet.publicKey} */
	public publicKey(): string | undefined {
		return this.#wallet.publicKey;
	}

	/** {@inheritDoc IReadOnlyWallet.username} */
	public username(): string | undefined {
		return this.#wallet.username;
	}

	/** {@inheritDoc IReadOnlyWallet.usernameOrAddress} */
	public usernameOrAddress(): string {
		return this.username() ?? this.address();
	}

	/** {@inheritDoc IReadOnlyWallet.rank} */
	public rank(): number | undefined {
		return this.#wallet.rank;
	}

	/** {@inheritDoc IReadOnlyWallet.avatar} */
	public avatar(): string {
		return Avatar.make(this.address());
	}

	/** {@inheritDoc IReadOnlyWallet.explorerLink} */
	public explorerLink(): string {
		return this.#wallet.explorerLink;
	}

	/** {@inheritDoc IReadOnlyWallet.isValidator} */
	public isValidator(): boolean {
		return this.#wallet.isValidator;
	}

	/** {@inheritDoc IReadOnlyWallet.isLegacyValidator} */
	public isLegacyValidator(): boolean {
		return this.#wallet.isLegacyValidator;
	}

	/** {@inheritDoc IReadOnlyWallet.isResignedDelegate} */
	public isResignedValidator(): boolean {
		return this.#wallet.isResignedValidator;
	}

	/** {@inheritDoc IReadOnlyWallet.governanceIdentifier} */
	public governanceIdentifier(): string {
		if (this.#wallet.governanceIdentifier === "address") {
			return this.address();
		}

		return this.publicKey()!;
	}
}
