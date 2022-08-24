/* eslint-disable sonarjs/cognitive-complexity */
import { Coins, Networks } from "@ardenthq/sdk";
import { Contracts, Environment } from "@ardenthq/sdk-profiles";
import { useTranslation } from "react-i18next";
import { generatePath } from "react-router-dom";
import { truncate } from "@ardenthq/sdk-helpers";
import { assertNetwork, assertProfile } from "@/utils/assertions";
import { findNetworkFromSearchParameters, profileAllEnabledNetworks } from "@/utils/network-utils";
import { ProfilePaths } from "@/router/paths";

interface RequiredParameters {
	network?: string;
	coin?: string;
	nethash?: string;
}

interface ValidateParameters {
	env: Environment;
	profile: Contracts.IProfile;
	network: Networks.Network;
	parameters: URLSearchParams;
}

interface PathProperties {
	env: Environment;
	profile: Contracts.IProfile;
	network: Networks.Network;
	parameters: URLSearchParams;
}

export const isAllowedNetwork = (network: string) => {
	const allowedNetworks = new Set(["ark.devnet", "ark.mainnet"]);

	return allowedNetworks.has(network);
};

const delegateFromSearchParameters = ({ env, network, parameters }: PathProperties) => {
	const delegateName = parameters.get("delegate");
	const delegatePublicKey = parameters.get("publicKey");

	if (delegateName) {
		try {
			return env.delegates().findByUsername(network?.coin(), network?.id(), delegateName);
		} catch {
			//
		}
	}

	if (delegatePublicKey) {
		try {
			return env.delegates().findByPublicKey(network?.coin(), network?.id(), delegatePublicKey);
		} catch {
			//
		}
	}
};

export const useSearchParametersValidation = () => {
	const { t } = useTranslation();

	const validateTransfer = async ({ profile, network, parameters }: ValidateParameters) => {
		const recipient = parameters.get("recipient");

		if (recipient) {
			const coin: Coins.Coin = profile.coins().set(network.coin(), network.id());

			await coin.__construct();

			const isValid = await coin.address().validate(recipient);

			if (!isValid) {
				throw new Error(t("TRANSACTION.VALIDATION.NETWORK_MISMATCH"));
			}
		}
	};

	const validateSign = async ({ parameters, profile, network }: ValidateParameters) => {
		const message = parameters.get("message");
		const address = parameters.get("address");

		if (!message) {
			throw new Error(t("TRANSACTION.VALIDATION.MESSAGE_MISSING"));
		}

		if (address) {
			const coin: Coins.Coin = profile.coins().set(network.coin(), network.id());

			await coin.__construct();

			const isValid = await coin.address().validate(address);

			if (!isValid) {
				throw new Error(t("TRANSACTION.VALIDATION.NETWORK_MISMATCH"));
			}
		}
	};

	const validateVote = async ({ parameters, profile, network, env }: ValidateParameters) => {
		const delegateName = parameters.get("delegate");
		const publicKey = parameters.get("publicKey");

		if (!delegateName && !publicKey) {
			throw new Error(t("TRANSACTION.VALIDATION.DELEGATE_MISSING"));
		}

		if (!!publicKey && !!delegateName) {
			throw new Error(t("TRANSACTION.VALIDATION.DELEGATE_OR_PUBLICKEY"));
		}

		const coin: Coins.Coin = profile.coins().set(network.coin(), network.id());
		await coin.__construct();

		await env.delegates().sync(profile, network.coin(), network.id());

		const delegate = delegateFromSearchParameters({ env, network, profile, parameters });

		const delegatePublicKey =
			publicKey &&
			truncate(publicKey, {
				length: 20,
				omissionPosition: "middle",
			});

		if (!delegate) {
			throw new Error(
				t("TRANSACTION.VALIDATION.DELEGATE_NOT_FOUND", { delegate: delegateName || delegatePublicKey }),
			);
		}

		if (delegate.isResignedDelegate()) {
			throw new Error(
				t("TRANSACTION.VALIDATION.DELEGATE_RESIGNED", { delegate: delegateName || delegatePublicKey }),
			);
		}
	};

	const methods = {
		sign: {
			path: ({ profile, parameters }: PathProperties) =>
				`${generatePath(ProfilePaths.SignMessage, {
					profileId: profile.id(),
				})}?${parameters.toString()}`,
			validate: validateSign,
		},
		transfer: {
			path: ({ profile, parameters }: PathProperties) =>
				`${generatePath(ProfilePaths.SendTransfer, {
					profileId: profile.id(),
				})}?${parameters.toString()}`,
			validate: validateTransfer,
		},
		vote: {
			path: ({ profile, parameters, env }: PathProperties) => {
				const network = findNetworkFromSearchParameters(profile, parameters);
				assertNetwork(network);

				const delegate = delegateFromSearchParameters({ env, network, profile, parameters });

				parameters.set("vote", delegate?.address() as string);

				return `${generatePath(ProfilePaths.SendVote, {
					profileId: profile.id(),
				})}?${parameters.toString()}`;
			},
			validate: validateVote,
		},
	};

	const validateSearchParameters = async (
		profile: Contracts.IProfile,
		env: Environment,
		parameters: URLSearchParams,
		requiredParameters?: RequiredParameters,
	) => {
		assertProfile(profile);

		const allEnabledNetworks = profileAllEnabledNetworks(profile);

		const coin = parameters.get("coin")?.toUpperCase();
		const method = parameters.get("method")?.toLowerCase();
		const networkId = parameters.get("network")?.toLowerCase();
		const nethash = parameters.get("nethash");

		if (!coin) {
			throw new Error(t("TRANSACTION.VALIDATION.COIN_MISSING"));
		}

		if (!networkId && !nethash) {
			throw new Error(t("TRANSACTION.VALIDATION.NETWORK_OR_NETHASH_MISSING"));
		}

		if (!method) {
			throw new Error(t("TRANSACTION.VALIDATION.METHOD_MISSING"));
		}

		if (requiredParameters?.coin && coin !== requiredParameters?.coin) {
			throw new Error(t("TRANSACTION.VALIDATION.COIN_MISMATCH"));
		}

		if (!allEnabledNetworks.some((item) => item.coin() === coin)) {
			throw new Error(t("TRANSACTION.VALIDATION.COIN_NOT_SUPPORTED", { coin }));
		}

		if (!Object.keys(methods).includes(method)) {
			throw new Error(t("TRANSACTION.VALIDATION.METHOD_NOT_SUPPORTED", { method }));
		}

		let network: Networks.Network | undefined;

		if (networkId) {
			if (requiredParameters?.network && networkId !== requiredParameters?.network) {
				throw new Error(t("TRANSACTION.VALIDATION.NETWORK_MISMATCH"));
			}

			if (!isAllowedNetwork(networkId)) {
				throw new Error(t("TRANSACTION.VALIDATION.NETWORK_INVALID", { network: networkId }));
			}

			network = allEnabledNetworks.find((item) => item.id() === networkId);

			/* istanbul ignore next */
			if (!network) {
				throw new Error(t("TRANSACTION.VALIDATION.NETWORK_NOT_ENABLED", { network: networkId }));
			}

			const availableWallets = profile.wallets().findByCoinWithNetwork(coin, networkId);

			if (availableWallets.length === 0) {
				throw new Error(t("TRANSACTION.VALIDATION.NETWORK_NO_WALLETS", { network: networkId }));
			}
		}

		if (nethash) {
			if (requiredParameters?.nethash && nethash !== requiredParameters?.nethash) {
				throw new Error(t("TRANSACTION.VALIDATION.NETWORK_MISMATCH"));
			}

			network = allEnabledNetworks.find((item) => item.meta().nethash === nethash);

			if (!network) {
				throw new Error(t("TRANSACTION.VALIDATION.NETHASH_NOT_ENABLED", { nethash }));
			}

			const availableWallets = profile.wallets().findByCoinWithNethash(coin, nethash);

			if (availableWallets.length === 0) {
				throw new Error(t("TRANSACTION.VALIDATION.NETHASH_NO_WALLETS", { nethash }));
			}
		}

		// method specific validation
		await methods[method].validate({ env, network, parameters, profile });

		const getPath = () =>
			methods[method].path({
				network,
				parameters,
				profile,
			});

		return {
			getPath,
		};
	};

	return { validateSearchParameters };
};
