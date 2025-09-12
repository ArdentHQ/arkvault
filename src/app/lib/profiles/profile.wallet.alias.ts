import { Contracts as ProfileContracts } from "@/app/lib/profiles";

export class WalletAliasProvider {
	#profile: ProfileContracts.IProfile;

	constructor(profile: ProfileContracts.IProfile) {
		this.#profile = profile;
	}

	#validatorUsername(address: string): string | undefined {
		try {
			return this.#profile
				.validators()
				.all(this.#profile.activeNetwork().id())
				.find((wallet) => wallet.address() === address)
				?.username();
		} catch {
			return undefined;
		}
	}

	public findAliasByAddress(address: string, network?: string): string | undefined {
		const profile = this.#profile;
		const networkId = network ?? this.#profile.activeNetwork().id();

		let alias: string | undefined;

		try {
			if (profile.knownWallets().is(networkId, address)) {
				return profile.knownWallets().name(networkId, address);
			}

			const useNetworkWalletNames = profile.appearance().get("useNetworkWalletNames");

			const wallet = profile.wallets().findByAddressWithNetwork(address, networkId);
			const onChainUsername = profile.usernames().username(networkId, address);

			const validatorName = this.#validatorUsername(address);

			const localName = wallet ? wallet.displayName() : undefined;

			if (localName) {
				alias = localName;
			}

			const username = wallet ? wallet?.username() : undefined;

			const contact = profile.contacts().findByAddress(address)[0];
			const contactName = contact?.name();

			alias = useNetworkWalletNames
				? username || localName || contactName || onChainUsername || validatorName
				: localName || contactName || username || onChainUsername || validatorName;

			return alias;
		} catch {
			return alias;
		}
	}
}
