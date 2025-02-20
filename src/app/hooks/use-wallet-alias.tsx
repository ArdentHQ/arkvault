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
}

const useWalletAlias = (): HookResult => {
	const { env } = useEnvironmentContext();

	const getWalletAlias = useCallback(
		({ address, profile, network, username }: Properties) => {
			try {
				assertProfile(profile);
				assertString(address);

				const useNetworkWalletNames = profile.appearance().get("useNetworkWalletNames");

				let wallet: Contracts.IReadWriteWallet | undefined;
				if (network) {
					wallet = profile.wallets().findByAddressWithNetwork(address, network.id());
				}

				const localName = wallet ? wallet.displayName() : undefined;
				const onChainName = wallet ? wallet.knownName() : username;

				const contact = profile.contacts().findByAddress(address)[0];
				const contactName = contact ? contact.name() : undefined;

				let alias: string | undefined;
				let isContact = false;

				if (useNetworkWalletNames) {
					if (onChainName) {
						alias = onChainName;
					} else if (localName) {
						alias = localName;
					} else if (contactName) {
						alias = contactName;
						isContact = true;
					}
				} else {
					if (localName) {
						alias = localName;
					} else if (contactName) {
						alias = contactName;
						isContact = true;
					} else if (onChainName) {
						alias = onChainName;
					}
				}

				return { address, alias, isContact };
			} catch {
				return { address, alias: undefined, isContact: false };
			}
		},
		[env],
	);

	return { getWalletAlias };
};

export { useWalletAlias };
export type { WalletAliasResult };
