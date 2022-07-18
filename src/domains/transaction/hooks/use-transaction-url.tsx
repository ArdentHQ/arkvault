import React from "react";
import { ProfilePaths } from "@/router/paths";
import { Contracts } from "@ardenthq/sdk-profiles";
import { generatePath } from "react-router";
import { useTranslation } from "react-i18next";

export const useTransactionURL = () => {
	const { t } = useTranslation();

	const validateTransferURLParams = (url: string) => {
		let searchParams: URLSearchParams;

		try {
			searchParams = new URL(url.replace("#", "/")).searchParams;
		} catch {
			return t("TRANSACTION.INVALID_URL");
		}

		if (!searchParams.get("network")) {
			return t("TRANSACTION.VALIDATION.NETWORK_MISSING");
		}

		if (!searchParams.get("coin")) {
			return t("TRANSACTION.VALIDATION.COIN_MISSING");
		}
	};

	const generateSendTransferPath = (profile: Contracts.IProfile, url: string) => {
		const path = generatePath(ProfilePaths.SendTransfer, { profileId: profile.id() });
		const urlSearchParams = new URL(url.replace("#", "/")).searchParams;

		return `${path}?${urlSearchParams.toString()}`;
	};

	return {
		validateTransferURLParams,
		generateSendTransferPath,
	};
};
