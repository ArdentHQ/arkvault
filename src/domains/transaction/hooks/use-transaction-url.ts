import { Contracts } from "@ardenthq/sdk-profiles";
import { generatePath } from "react-router";
import { useTranslation } from "react-i18next";
import { ProfilePaths } from "@/router/paths";

const generateSendTransferPath = (profile: Contracts.IProfile, url: string) => {
	const path = generatePath(ProfilePaths.SendTransfer, { profileId: profile.id() });
	const urlSearchParameters = new URL(url.replace("#", "/")).searchParams;

	return `${path}?${urlSearchParameters.toString()}`;
};

export const useTransactionURL = () => {
	const { t } = useTranslation();

	const validateTransferURLParameters = (url: string) => {
		let searchParameters: URLSearchParams;

		try {
			searchParameters = new URL(url.replace("#", "/")).searchParams;
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
	};

	return {
		generateSendTransferPath,
		validateTransferURLParams: validateTransferURLParameters,
	};
};
