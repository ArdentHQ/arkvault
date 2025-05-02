import { Networks } from "@/app/lib/sdk";
import { Contracts } from "@/app/lib/profiles";
import { useCallback } from "react";
import { useEnvironmentContext } from "@/app/contexts";
import { assertProfile, assertString } from "@/utils/assertions";

interface Properties {
	address: string;
	network?: Networks.Network;
	profile?: Contracts.IProfile;
}

interface WalletAliasResult {
	alias?: string;
	isContact?: boolean;
	address: string;
}

interface HookResult {
	getWalletAlias: (input: Properties) => WalletAliasResult;
	syncOnChainUsernames: (input: {
		profile: Contracts.IProfile;
		networks: Networks.Network[];
		addresses: string[];
	}) => Promise<void>;
}

const useWalletAlias = (): HookResult => {
	const { env } = useEnvironmentContext();
	let alias: string | undefined;

	const getWalletAlias = useCallback(
		({ address, profile, network }: Properties) => {
			try {
				assertProfile(profile);
				assertString(address);

				if (network && env.knownWallets().is(network.id(), address)) {
					return {
						address,
						alias: env.knownWallets().name(network.id(), address),
						isContact: false,
					};
				}

				const useNetworkWalletNames = profile.appearance().get("useNetworkWalletNames");

				let wallet: Contracts.IReadWriteWallet | undefined;

				let onChainUsername: string | undefined;

				if (network) {
					wallet = profile.wallets().findByAddressWithNetwork(address, network.id());
					onChainUsername = env.usernames().username(network.id(), address);
				}

				const localName = wallet ? wallet.displayName() : undefined;

				if (localName) {
					alias = localName;
				}

				const username = wallet ? wallet.username() : undefined;

				const contact = profile.contacts().findByAddress(address)[0];

				const contactName = contact ? contact.name() : undefined;

				alias = useNetworkWalletNames
					? username || localName || contactName || onChainUsername
					: localName || contactName || username || onChainUsername;

				const isContact = alias === contactName && contactName !== undefined;

				return { address, alias, isContact };
			} catch {
				return { address, alias, isContact: false };
			}
		},
		[env],
	);

	const syncOnChainUsernames = useCallback(
		async ({
			profile,
			networks,
			addresses,
		}: {
			profile: Contracts.IProfile;
			networks: Networks.Network[];
			addresses: string[];
		}) => {
			for (const network of networks) {
				await env.usernames().syncUsernames(profile, network.coin(), network.id(), addresses);
			}
		},
		[env],
	);

	return { getWalletAlias, syncOnChainUsernames };
};

export { useWalletAlias };
export type { WalletAliasResult };
