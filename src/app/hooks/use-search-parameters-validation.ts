/* eslint-disable sonarjs/cognitive-complexity */
import { Coins, Networks } from "@ardenthq/sdk";
import { Contracts, Environment } from "@ardenthq/sdk-profiles";
import { useTranslation } from "react-i18next";
import { generatePath } from "react-router-dom";
import { truncate } from "@ardenthq/sdk-helpers";
import { assertNetwork, assertProfile } from "@/utils/assertions";
import { findNetworkFromSearchParameters, profileAllEnabledNetworks, profileDefaultNetworks } from "@/utils/network-utils";
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
	searchParameters: URLSearchParams;
}

enum SearchParametersError {
	AmbiguousDelegate = "AMBIGUOUS_DELEGATE",
	CoinMismatch = "COIN_MISMATCH",
	CoinNotSupported = "COIN_NOT_SUPPORTED",
	DelegateNotFound = "DELEGATE_NOT_FOUND",
	DelegateResigned = "DELEGATE_RESIGNED",
	MethodNotSupported = "METHOD_NOT_SUPPORTED",
	MissingDelegate = "MISSING_DELEGATE",
	MissingMethod = "MISSING_METHOD",
	MissingNetworkOrNethash = "MISSING_NETWORK_OR_NETHASH",
	NethashNotEnabled = "NETHASH_NOT_ENABLED",
	NethashNoWallets = "NETHASH_NO_WALLETS",
	NetworkInvalid = "NETWORK_INVALID",
	NetworkMismatch = "NETWORK_MISMATCH",
	NetworkNotEnabled = "NETWORK_NOT_ENABLED",
	NetworkNoWallets = "NETWORK_NO_WALLETS",
}

export const isAllowedNetwork = (network: string) => {
	const allowedNetworks = new Set(["ark.devnet", "ark.mainnet"]);

	return allowedNetworks.has(network);
};

const delegateFromSearchParameters = ({ env, network, searchParameters }: PathProperties) => {
	const delegateName = searchParameters.get("delegate");
	const delegatePublicKey = searchParameters.get("publicKey");

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

const validateVote = async ({ parameters, profile, network, env }: ValidateParameters) => {
	const delegateName = parameters.get("delegate");
	const publicKey = parameters.get("publicKey");

	if (!delegateName && !publicKey) {
		return { error: { type: SearchParametersError.MissingDelegate } };
	}

	if (!!publicKey && !!delegateName) {
		return { error: { type: SearchParametersError.AmbiguousDelegate } };
	}

	const coin: Coins.Coin = profile.coins().set(network.coin(), network.id());
	await coin.__construct();

	await env.delegates().sync(profile, network.coin(), network.id());

	const delegate = delegateFromSearchParameters({ env, network, profile, searchParameters: parameters });

	const delegatePublicKey =
		publicKey &&
		truncate(publicKey, {
			length: 20,
			omissionPosition: "middle",
		});

	if (!delegate) {
		return { error: { type: SearchParametersError.DelegateNotFound, value: delegateName || delegatePublicKey } };
	}

	if (delegate.isResignedDelegate()) {
		return { error: { type: SearchParametersError.DelegateResigned, value: delegateName || delegatePublicKey } };
	}
};

const validateTransfer = async ({ profile, network, parameters }: ValidateParameters) => {
	const recipient = parameters.get("recipient");

	if (recipient) {
		const coin: Coins.Coin = profile.coins().set(network.coin(), network.id());

		await coin.__construct();

		const isValid = await coin.address().validate(recipient);

		if (!isValid) {
			return { error: { type: SearchParametersError.NetworkMismatch } };
		}
	}
};

const getError = (message: string) => `Invalid URI: ${message}`;

export const useSearchParametersValidation = () => {
	const { t } = useTranslation();

	const methods = {
		transfer: {
			path: ({ profile, searchParameters }: PathProperties) =>
				`${generatePath(ProfilePaths.SendTransfer, {
					profileId: profile.id(),
				})}?${searchParameters.toString()}`,
			validate: validateTransfer,
		},
		vote: {
			path: ({ profile, searchParameters, env }: PathProperties) => {
				const network = findNetworkFromSearchParameters(profile, searchParameters);
				assertNetwork(network);

				const delegate = delegateFromSearchParameters({ env, network, profile, searchParameters });

				searchParameters.set("vote", delegate?.address() as string);

				return `${generatePath(ProfilePaths.SendVote, {
					profileId: profile.id(),
				})}?${searchParameters.toString()}`;
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

		const defaultNetworks = profileDefaultNetworks(profile);
		const allEnabledNetworks = profileAllEnabledNetworks(profile);

		const coin = parameters.get("coin")?.toUpperCase() || "ARK";
		const method = parameters.get("method")?.toLowerCase();
		const networkId = parameters.get("network")?.toLowerCase();
		const nethash = parameters.get("nethash");

		if (!networkId && !nethash) {
			return { error: { type: SearchParametersError.MissingNetworkOrNethash } };
		}

		if (!method) {
			return { error: { type: SearchParametersError.MissingMethod } };
		}

		if (requiredParameters?.coin && coin !== requiredParameters?.coin) {
			return { error: { type: SearchParametersError.CoinMismatch } };
		}

		if (!allEnabledNetworks.some((item) => item.coin() === coin)) {
			return { error: { type: SearchParametersError.CoinNotSupported, value: coin } };
		}

		if (!Object.keys(methods).includes(method)) {
			return { error: { type: SearchParametersError.MethodNotSupported, value: method } };
		}

		let network: Networks.Network | undefined;

		if (networkId) {
			if (requiredParameters?.network && networkId !== requiredParameters?.network) {
				return { error: { type: SearchParametersError.NetworkMismatch } };
			}

			network = defaultNetworks.find((item) => item.id() === networkId);

			if (!network) {
				return { error: { type: SearchParametersError.NetworkInvalid, value: networkId } };
			}

			/* istanbul ignore next */
			if (!network.meta().enabled) {
				return { error: { type: SearchParametersError.NetworkNotEnabled, value: network.displayName() } };
			}

			const availableWallets = profile.wallets().findByCoinWithNetwork(coin, networkId);

			if (availableWallets.length === 0) {
				return { error: { type: SearchParametersError.NetworkNoWallets, value: networkId } };
			}
		}

		if (nethash) {
			if (requiredParameters?.nethash && nethash !== requiredParameters?.nethash) {
				return { error: { type: SearchParametersError.NetworkMismatch } };
			}

			network = defaultNetworks.find((item) => item.meta().nethash === nethash);

			if (network && !network.meta().enabled) {
				return { error: { type: SearchParametersError.NethashNotEnabled, value: network.displayName() } };
			}

			network = allEnabledNetworks.find((item) => item.meta().nethash === nethash);

			const truncated = truncate(nethash, {
				length: 20,
				omissionPosition: "middle",
			});

			if (!network) {
				return { error: { type: SearchParametersError.NethashNotEnabled, value: truncated } };
			}

			const availableWallets = profile.wallets().findByCoinWithNethash(coin, nethash);

			if (availableWallets.length === 0) {
				return { error: { type: SearchParametersError.NethashNoWallets, value: truncated } };
			}
		}

		// method specific validation
		return await methods[method].validate({ env, network, parameters, profile });
	};

	const buildSearchParametersError = ({ type, value }: { type: SearchParametersError; value?: string }) => {
		if (type === SearchParametersError.AmbiguousDelegate) {
			return getError(t("TRANSACTION.VALIDATION.DELEGATE_OR_PUBLICKEY"));
		}

		if (type === SearchParametersError.CoinMismatch) {
			return getError(t("TRANSACTION.VALIDATION.COIN_MISMATCH"));
		}

		if (type === SearchParametersError.CoinNotSupported) {
			return getError(t("TRANSACTION.VALIDATION.COIN_NOT_SUPPORTED", { coin: value }));
		}

		if (type === SearchParametersError.DelegateNotFound) {
			return getError(t("TRANSACTION.VALIDATION.DELEGATE_NOT_FOUND", { delegate: value }));
		}

		if (type === SearchParametersError.DelegateResigned) {
			return getError(t("TRANSACTION.VALIDATION.DELEGATE_RESIGNED", { delegate: value }));
		}

		if (type === SearchParametersError.MethodNotSupported) {
			return getError(t("TRANSACTION.VALIDATION.METHOD_NOT_SUPPORTED", { method: value }));
		}

		if (type === SearchParametersError.MissingDelegate) {
			return getError(t("TRANSACTION.VALIDATION.DELEGATE_MISSING"));
		}

		if (type === SearchParametersError.MissingMethod) {
			return getError(t("TRANSACTION.VALIDATION.METHOD_MISSING"));
		}

		if (type === SearchParametersError.MissingNetworkOrNethash) {
			return getError(t("TRANSACTION.VALIDATION.NETWORK_OR_NETHASH_MISSING"));
		}

		if (type === SearchParametersError.NethashNotEnabled) {
			return getError(t("TRANSACTION.VALIDATION.NETHASH_NOT_ENABLED", { nethash: value }));
		}

		if (type === SearchParametersError.NethashNoWallets) {
			return getError(t("TRANSACTION.VALIDATION.NETHASH_NO_WALLETS", { nethash: value }));
		}

		if (type === SearchParametersError.NetworkInvalid) {
			return getError(t("TRANSACTION.VALIDATION.NETWORK_INVALID", { network: value }));
		}

		if (type === SearchParametersError.NetworkMismatch) {
			return getError(t("TRANSACTION.VALIDATION.NETWORK_MISMATCH"));
		}

		if (type === SearchParametersError.NetworkNotEnabled) {
			return getError(t("TRANSACTION.VALIDATION.NETWORK_NOT_ENABLED", { network: value }));
		}

		if (type === SearchParametersError.NetworkNoWallets) {
			return getError(t("TRANSACTION.VALIDATION.NETWORK_NO_WALLETS", { network: value }));
		}

		/* istanbul ignore next */
		return getError("Unknown Error");
	};

	return { buildSearchParametersError, methods, validateSearchParameters };
};
