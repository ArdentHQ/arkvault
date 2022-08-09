import React from "react";
import { useTranslation } from "react-i18next";
import { Page } from "@/app/components/Layout";

export const VerifyMessage = () => {
	const { t } = useTranslation();

	return <Page pageTitle={t("MESSAGE.PAGE_VERIFY_MESSAGE.TITLE")}>verify</Page>;
};
