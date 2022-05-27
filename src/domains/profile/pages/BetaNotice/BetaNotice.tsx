import React from "react";
import { useTranslation } from "react-i18next";

import { BetaNoticeModal } from "./BetaNotice.blocks";
import { Page } from "@/app/components/Layout";

interface BetaNoticeProperties {
	onContinue: () => void;
}

export const BetaNotice: React.FC<BetaNoticeProperties> = ({ onContinue }) => {
	const { t } = useTranslation();

	return (
		<Page pageTitle={t("PROFILE.MODAL_BETA_NOTICE.TITLE")} navbarVariant="logo-only">
			<BetaNoticeModal onContinue={onContinue} />
		</Page>
	);
};
