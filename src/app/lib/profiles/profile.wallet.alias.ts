import { Networks } from "@/app/lib/mainsail";
import { Contracts as ProfileContracts } from "@/app/lib/profiles";

export class WalletAliasProvider {
	#profile: ProfileContracts.IProfile;

	constructor(profile: ProfileContracts.IProfile) {
		this.#profile = profile;
	}

	public findAliasByAddress(address: string, network?: string): string | undefined {
		const profile = this.#profile;
		const networkId = network ?? this.#profile.activeNetwork().id()

		let alias: string | undefined;
		console.log(address)

		try {
			if (profile.knownWallets().is(networkId, address)) {
				console.log("known")
				return profile.knownWallets().name(networkId, address)
			}

			const useNetworkWalletNames = profile.appearance().get("useNetworkWalletNames");

			const wallet = profile.wallets().findByAddressWithNetwork(address, networkId);
			const onChainUsername = profile.usernames().username(networkId, address);

			const localName = wallet ? wallet.displayName() : undefined;

			console.log({ localName })
			if (localName) {
				alias = localName;
			}

			console.log({ wallet })
			const username = wallet ? wallet.username() : undefined;
			console.log({ username })

			const contact = profile.contacts().findByAddress(address)[0];
			const contactName = contact.name()

			console.log({ contact })

			alias = useNetworkWalletNames
				? username || localName || contactName || onChainUsername
				: localName || contactName || username || onChainUsername;

			console.log({ alias })

			return alias
		} catch {
			return alias
		}
	}
}
