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
	isValidator: boolean;
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

				const checkIfDelegate = (network?: Networks.Network): boolean => {
					if (!network) {
						return false;
					}

					try {
						const delegate = env.delegates().findByAddress(network.coin(), network.id(), address);

						return delegate.isDelegate();
					} catch {
						return false;
					}
				};

				let wallet: Contracts.IReadWriteWallet | undefined;

				if (network) {
					wallet = profile.wallets().findByAddressWithNetwork(address, network.id());
				}

				if (wallet) {
					return {
						address,
						alias: wallet.displayName(),
						isContact: false,
						isValidator: checkIfDelegate(network),
					};
				}

				const contact = profile.contacts().findByAddress(address)[0];

				if (contact) {
					return {
						address,
						alias: contact.name(),
						isContact: true,
						isValidator: checkIfDelegate(network),
					};
				}

				if (username) {
					return {
						address,
						alias: username,
						isContact: false,
						isValidator: checkIfDelegate(network),
					};
				}
			} catch {
				//
			}

			return {
				address,
				alias: undefined,
				isContact: false,
				isValidator: false,
			};
		},
		[env],
	);

	return { getWalletAlias };
};

export { useWalletAlias };

export type { WalletAliasResult };
