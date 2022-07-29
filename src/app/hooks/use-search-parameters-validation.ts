/* eslint-disable sonarjs/cognitive-complexity */
import { Coins, Networks } from "@ardenthq/sdk";
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

	const validateSearchParameters = async (
		profile: Contracts.IProfile,
		URLParameters: URLSearchParams,
		requiredParameters?: RequiredParameters,
	) => {
		assertProfile(profile);

		const allEnabledNetworks = profileAllEnabledNetworks(profile);

		const coin = URLParameters.get("coin");
		const method = URLParameters.get("method");
		const networkId = URLParameters.get("network");
		const nethash = URLParameters.get("nethash");
		const recipient = URLParameters.get("recipient");

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

		if (!networkId && !nethash) {
			throw new Error(t("TRANSACTION.VALIDATION.NETWORK_OR_NETHASH_MISSING"));
		}

		if (!allEnabledNetworks.some((item) => lowerCaseEquals(item.coin(), coin))) {
			throw new Error(t("TRANSACTION.VALIDATION.COIN_NOT_SUPPORTED", { coin }));
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

		if (recipient && network) {
			const coin: Coins.Coin = profile.coins().set(network.coin(), network.id());

			const isValid = await coin.address().validate(recipient);

			if (!isValid) {
				throw new Error("address/network mismatch");
			}
		}
	};

	return { validateSearchParameters };
};
