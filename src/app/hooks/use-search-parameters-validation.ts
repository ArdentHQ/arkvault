/* eslint-disable sonarjs/cognitive-complexity */
import { Coins, Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useTranslation } from "react-i18next";
import { generatePath } from "react-router-dom";
import { assertProfile } from "@/utils/assertions";
import { profileAllEnabledNetworks } from "@/utils/network-utils";
import { ProfilePaths } from "@/router/paths";

interface RequiredParameters {
	network?: string;
	coin?: string;
	nethash?: string;
}

const allowedNetworks = new Set(["ark.devnet", "ark.mainnet"]);

export const useSearchParametersValidation = () => {
	const { t } = useTranslation();

	const validateTransfer = async (
		profile: Contracts.IProfile,
		network: Networks.Network,
		parameters: URLSearchParams,
	) => {
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

	// TODO: refactor after message signing is merged
	const validateVerify = (_: any, __: any, parameters: URLSearchParams) => {
		const message = parameters.get("message");
		const signatory = parameters.get("signatory");
		const signature = parameters.get("signature");

		if (!message) {
			throw new Error(t("TRANSACTION.VALIDATION.PARAMETER_MISSING", { parameter: t("COMMON.MESSAGE") }));
		}

		if (!signatory) {
			throw new Error(t("TRANSACTION.VALIDATION.PARAMETER_MISSING", { parameter: t("COMMON.SIGNATORY") }));
		}

		if (!signature) {
			throw new Error(t("TRANSACTION.VALIDATION.PARAMETER_MISSING", { parameter: t("COMMON.SIGNATURE") }));
		}
	};

	const methods = {
		transfer: {
			path: (profileId: string) => generatePath(ProfilePaths.SendTransfer, { profileId }),
			validate: validateTransfer,
		},
		verify: {
			path: (profileId: string) => generatePath(ProfilePaths.VerifyMessage, { profileId }),
			validate: validateVerify,
		},
	};

	const validateSearchParameters = async (
		profile: Contracts.IProfile,
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
			throw new Error(t("TRANSACTION.VALIDATION.PARAMETER_MISSING", { parameter: t("COMMON.COIN") }));
		}

		if (!networkId && !nethash) {
			throw new Error(
				t("TRANSACTION.VALIDATION.PARAMETER_MISSING", { parameter: t("COMMON.NETWORK_OR_NETHASH") }),
			);
		}

		if (!method) {
			throw new Error(t("TRANSACTION.VALIDATION.PARAMETER_MISSING", { parameter: t("COMMON.METHOD") }));
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

			if (!allowedNetworks.has(networkId)) {
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
		await methods[method].validate(profile, network, parameters);
	};

	return { methods, validateSearchParameters };
};
