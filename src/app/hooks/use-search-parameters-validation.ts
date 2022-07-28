/* eslint-disable sonarjs/cognitive-complexity */
import { Contracts } from "@ardenthq/sdk-profiles";
import { useTranslation } from "react-i18next";
import { assertProfile } from "@/utils/assertions";
import { lowerCaseEquals } from "@/utils/equals";
import { profileAllEnabledNetworks } from "@/utils/network-utils";

interface RequiredParameters {
	network?: string;
	coin?: string;
	nethash?: string;
}

const allowedNetworks = ["ark.devnet", "ark.mainnet"];
const allowedMethods = ["transfer"];

export const useSearchParametersValidation = () => {
	const { t } = useTranslation();

	const validateSearchParameters = (
		profile: Contracts.IProfile,
		URLParameters: URLSearchParams,
		requiredParameters?: RequiredParameters,
	) => {
		assertProfile(profile);

		const allEnabledNetworks = profileAllEnabledNetworks(profile);

		const coin = URLParameters.get("coin");
		const method = URLParameters.get("method");
		const network = URLParameters.get("network");
		const nethash = URLParameters.get("nethash");

		if (!coin) {
			throw new Error(t("TRANSACTION.VALIDATION.COIN_MISSING"));
		}

		if (requiredParameters?.coin && !lowerCaseEquals(coin, requiredParameters?.coin)) {
			throw new Error(t("TRANSACTION.VALIDATION.COIN_MISMATCH"));
		}

		if (!method) {
			throw new Error(t("TRANSACTION.VALIDATION.METHOD_MISSING"));
		}

		if (!allowedMethods.some((item) => lowerCaseEquals(item, method))) {
			throw new Error(t("TRANSACTION.VALIDATION.METHOD_NOT_SUPPORTED", { method }));
		}

		if (!network && !nethash) {
			throw new Error(t("TRANSACTION.VALIDATION.NETWORK_OR_NETHASH_MISSING"));
		}

		if (!allEnabledNetworks.some((item) => lowerCaseEquals(item.coin(), coin))) {
			throw new Error(t("TRANSACTION.VALIDATION.COIN_NOT_SUPPORTED", { coin }));
		}

		if (network) {
			if (requiredParameters?.network && network !== requiredParameters?.network) {
				throw new Error(t("TRANSACTION.VALIDATION.NETWORK_MISMATCH"));
			}

			if (!allowedNetworks.some((item) => lowerCaseEquals(item, network))) {
				throw new Error(t("TRANSACTION.VALIDATION.NETWORK_INVALID", { network }));
			}

			/* istanbul ignore next */
			if (!allEnabledNetworks.some((item) => lowerCaseEquals(item.id(), network))) {
				throw new Error(t("TRANSACTION.VALIDATION.NETWORK_NOT_ENABLED", { network }));
			}

			const availableWallets = profile.wallets().findByCoinWithNetwork(coin.toUpperCase(), network.toLowerCase());

			if (availableWallets.length === 0) {
				throw new Error(t("TRANSACTION.VALIDATION.NETWORK_NO_WALLETS", { network }));
			}
		}

		if (nethash) {
			if (requiredParameters?.nethash && nethash !== requiredParameters?.nethash) {
				throw new Error(t("TRANSACTION.VALIDATION.NETWORK_MISMATCH"));
			}

			if (!allEnabledNetworks.some((network) => network.meta().nethash === nethash)) {
				throw new Error(t("TRANSACTION.VALIDATION.NETHASH_NOT_ENABLED", { nethash }));
			}

			const availableWallets = profile.wallets().findByCoinWithNethash(coin.toUpperCase(), nethash);

			if (availableWallets.length === 0) {
				throw new Error(t("TRANSACTION.VALIDATION.NETHASH_NO_WALLETS", { nethash }));
			}
		}
	};

	return { validateSearchParameters };
};
