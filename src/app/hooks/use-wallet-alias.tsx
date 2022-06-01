import { Networks } from "@payvo/sdk";
import { Contracts } from "@payvo/sdk-profiles";
import { useCallback } from "react";

import { useEnvironmentContext } from "@/app/contexts";
import { assertProfile, assertString } from "@/utils/assertions";

interface Properties {
	address?: string;
	network?: Networks.Network;
	profile?: Contracts.IProfile;
}

interface WalletAliasResult {
	alias: string | undefined;
	isContact: boolean;
	isDelegate: boolean;
}

interface HookResult {
	getWalletAlias: (input: Properties) => WalletAliasResult;
}

const useWalletAlias = (): HookResult => {
	const { env } = useEnvironmentContext();

	const getWalletAlias = useCallback(
		({ address, profile, network }: Properties) => {
			try {
				assertProfile(profile);
				assertString(address);

				const getDelegateUsername = (network?: Networks.Network): string | undefined => {
					if (!network) {
						return undefined;
					}

					try {
						const delegate = env.delegates().findByAddress(network.coin(), network.id(), address);

						return delegate.username();
					} catch {
						return undefined;
					}
				};

				let wallet: Contracts.IReadWriteWallet | undefined;

				if (network) {
					wallet = profile.wallets().findByAddressWithNetwork(address, network.id());
				}

				if (wallet) {
					const delegateUsername = getDelegateUsername(wallet.network());

					let alias = wallet.displayName();

					if (delegateUsername && profile.appearance().get("useNetworkWalletNames")) {
						alias = delegateUsername;
					}

					return {
						alias,
						isContact: false,
						isDelegate: !!delegateUsername,
					};
				}

				const contact = profile.contacts().findByAddress(address)[0];

				if (contact) {
					return {
						alias: contact.name(),
						isContact: true,
						isDelegate: !!getDelegateUsername(network),
					};
				}

				if (network) {
					const alias = getDelegateUsername(network);

					return {
						alias,
						isContact: false,
						isDelegate: alias !== undefined,
					};
				}
			} catch {
				//
			}

			return {
				alias: undefined,
				isContact: false,
				isDelegate: false,
			};
		},
		[env],
	);

	return { getWalletAlias };
};

export { useWalletAlias };

export type { WalletAliasResult };
