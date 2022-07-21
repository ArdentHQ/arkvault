import { Contracts } from "@ardenthq/sdk-profiles";
import { generatePath } from "react-router";
import { useTranslation } from "react-i18next";
import { ProfilePaths } from "@/router/paths";

type RequiredOptions = {
	network?: string;
	coin?: string;
	nethash?: string;
};

const generateSendTransferPath = (profile: Contracts.IProfile, url: string) => {
	const path = generatePath(ProfilePaths.SendTransfer, { profileId: profile.id() });
	const urlSearchParameters = new URL(url.replace("#", "/")).searchParams;

	return `${path}?${urlSearchParameters.toString()}`;
};

export const useTransactionURL = () => {
	const { t } = useTranslation();

	const urlSearchParameters = (url: string) => new URL(url.replace("#", "/")).searchParams;

	const validateTransferURLParameters = (url: string, requiredOptions: RequiredOptions) => {
		let searchParameters: URLSearchParams;

		try {
			searchParameters = urlSearchParameters(url);
		} catch {
			return t("TRANSACTION.INVALID_URL");
		}

		if (!searchParameters.get("coin")) {
			return t("TRANSACTION.VALIDATION.COIN_MISSING");
		}

		const network = searchParameters.get("network");
		const nethash = searchParameters.get("nethash");

		if (network && !["ark.devnet", "ark.mainnet"].includes(network)) {
			return t("TRANSACTION.VALIDATION.NETWORK_INVALID");
		}

		if (!network && !nethash) {
			return t("TRANSACTION.VALIDATION.NETWORK_OR_NETHASH_MISSING");
		}

		if (!!network && network !== requiredOptions.network) {
			return t("TRANSACTION.VALIDATION.NETWORK_MISMATCH");
		}

		if (!!nethash && nethash !== requiredOptions.nethash) {
			return t("TRANSACTION.VALIDATION.NETWORK_MISMATCH");
		}

		if (searchParameters.get("coin") !== requiredOptions.coin) {
			return t("TRANSACTION.VALIDATION.COIN_MISMATCH");
		}
	};

	return {
		urlSearchParameters,
		generateSendTransferPath,
		validateTransferURLParams: validateTransferURLParameters,
	};
};
