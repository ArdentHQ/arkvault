/* eslint-disable sonarjs/cognitive-complexity */
import { Coins, Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useTranslation } from "react-i18next";
import { generatePath } from "react-router-dom";
import { assertProfile } from "@/utils/assertions";
import { lowerCaseEquals } from "@/utils/equals";
import { profileAllEnabledNetworks } from "@/utils/network-utils";
import { ProfilePaths } from "@/router/paths";

interface RequiredParameters {
	network?: string;
	coin?: string;
	nethash?: string;
}

const allowedNetworks = ["ark.devnet", "ark.mainnet"];

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

	const methods = {
		transfer: {
			path: (profileId: string) => generatePath(ProfilePaths.SendTransfer, { profileId }),
			validate: validateTransfer,
		},
	};

	const validateSearchParameters = async (
		profile: Contracts.IProfile,
		parameters: URLSearchParams,
		requiredParameters?: RequiredParameters,
	) => {
		assertProfile(profile);

		const allEnabledNetworks = profileAllEnabledNetworks(profile);

		const coin = parameters.get("coin");
		const method = parameters.get("method");
		const nethash = parameters.get("nethash");
		const networkId = parameters.get("network");

		if (!coin) {
			throw new Error(t("TRANSACTION.VALIDATION.COIN_MISSING"));
		}

		if (!networkId && !nethash) {
			throw new Error(t("TRANSACTION.VALIDATION.NETWORK_OR_NETHASH_MISSING"));
		}

		if (!method) {
			throw new Error(t("TRANSACTION.VALIDATION.METHOD_MISSING"));
		}

		if (requiredParameters?.coin && !lowerCaseEquals(coin, requiredParameters?.coin)) {
			throw new Error(t("TRANSACTION.VALIDATION.COIN_MISMATCH"));
		}

		if (!allEnabledNetworks.some((item) => lowerCaseEquals(item.coin(), coin))) {
			throw new Error(t("TRANSACTION.VALIDATION.COIN_NOT_SUPPORTED", { coin }));
		}

		if (!Object.keys(methods).some((item) => lowerCaseEquals(item, method))) {
			throw new Error(t("TRANSACTION.VALIDATION.METHOD_NOT_SUPPORTED", { method }));
		}

		let network: Networks.Network | undefined;

		if (networkId) {
			if (requiredParameters?.network && networkId !== requiredParameters?.network) {
				throw new Error(t("TRANSACTION.VALIDATION.NETWORK_MISMATCH"));
			}

			if (!allowedNetworks.some((item) => lowerCaseEquals(item, networkId))) {
				throw new Error(t("TRANSACTION.VALIDATION.NETWORK_INVALID", { network: networkId }));
			}

			network = allEnabledNetworks.find((item) => lowerCaseEquals(item.id(), networkId));

			/* istanbul ignore next */
			if (!network) {
				throw new Error(t("TRANSACTION.VALIDATION.NETWORK_NOT_ENABLED", { network: networkId }));
			}

			const availableWallets = profile
				.wallets()
				.findByCoinWithNetwork(coin.toUpperCase(), networkId.toLowerCase());

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

			const availableWallets = profile.wallets().findByCoinWithNethash(coin.toUpperCase(), nethash);

			if (availableWallets.length === 0) {
				throw new Error(t("TRANSACTION.VALIDATION.NETHASH_NO_WALLETS", { nethash }));
			}
		}

		// method specific validation
		await methods[method].validate(profile, network, parameters);
	};

	return { methods, validateSearchParameters };
};
