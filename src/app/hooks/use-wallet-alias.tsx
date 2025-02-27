import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useCallback } from "react";
import { useEnvironmentContext } from "@/app/contexts";
import { assertProfile, assertString } from "@/utils/assertions";

interface Properties {
	address: string;
	network?: Networks.Network;
	profile?: Contracts.IProfile;
	username?: string;
}

interface WalletAliasResult {
	alias: string | undefined;
	isContact: boolean;
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
				if (network) {
					wallet = profile.wallets().findByAddressWithNetwork(address, network.id());
				}

				const localName = wallet ? wallet.displayName() : undefined;

				const onChainName = wallet ? wallet.username() : undefined;

				const contact = profile.contacts().findByAddress(address)[0];
				const contactName = contact ? contact.name() : undefined;

				const alias = useNetworkWalletNames
					? onChainName || localName || contactName
					: localName || contactName || onChainName;

				const isContact = alias === contactName && contactName !== undefined;

				return { address, alias, isContact };
			} catch {
				return { address, alias: undefined, isContact: false };
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
				const coin = profile.coins().get(network.coin(), network.id());
				await coin.__construct();
				await env.usernames().syncUsernames(profile, network.coin(), network.id(), addresses);
			}
		},
		[env],
	);

	return { getWalletAlias, syncOnChainUsernames };
};

export { useWalletAlias };
export type { WalletAliasResult };
