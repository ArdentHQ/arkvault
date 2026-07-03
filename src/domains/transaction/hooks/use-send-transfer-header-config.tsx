import { SendTransferStep } from "@/domains/transaction/components/SendTransferSidePanel/SendTransfer.contracts";
import { useTranslation } from "react-i18next";
import { getAuthenticationStepSubtitle } from "@/domains/transaction/utils";
import { Contracts } from "@/app/lib/profiles";
import { Image } from "@/app/components/Image";
import { ThemeIcon } from "@/app/components/Icon";
import cn from "classnames";
import React from "react";

interface SendTransferStepConfigProperties {
	activeTab: SendTransferStep;
	isConfirmed: boolean;
	wallet?: Contracts.IReadWriteWallet;
}

export const useSendTransferStepConfig = ({ activeTab, wallet, isConfirmed }: SendTransferStepConfigProperties) => {
	const { t } = useTranslation();

	const getTitle = () => {
		if (activeTab === SendTransferStep.ErrorStep) {
			return t("TRANSACTION.ERROR.TITLE");
		}

		if (activeTab === SendTransferStep.AuthenticationStep) {
			return t("TRANSACTION.AUTHENTICATION_STEP.TITLE");
		}

		if (activeTab === SendTransferStep.ReviewStep) {
			return t("TRANSACTION.REVIEW_STEP.TITLE");
		}

		if (activeTab === SendTransferStep.SummaryStep) {
			return isConfirmed ? t("TRANSACTION.SUCCESS.CREATED") : t("TRANSACTION.PENDING.TITLE");
		}

		return t("TRANSACTION.PAGE_TRANSACTION_SEND.FORM_STEP.TITLE");
	};

	const getSubtitle = () => {
		if (activeTab === SendTransferStep.ReviewStep) {
			return t("TRANSACTION.REVIEW_STEP.DESCRIPTION");
		}

		if (activeTab === SendTransferStep.AuthenticationStep) {
			return getAuthenticationStepSubtitle({ t, wallet });
		}

		if (activeTab === SendTransferStep.FormStep) {
			return t("TRANSACTION.PAGE_TRANSACTION_SEND.FORM_STEP.DESCRIPTION");
		}

		return;
	};

	const getTitleIcon = () => {
		if (activeTab === SendTransferStep.ErrorStep) {
			return <Image name="ErrorHeaderIcon" domain="transaction" className="block h-5 w-5" />;
		}

		if (activeTab === SendTransferStep.SummaryStep) {
			return (
				<ThemeIcon
					lightIcon={isConfirmed ? "CheckmarkDoubleCircle" : "UnconfirmedTransaction"}
					darkIcon={isConfirmed ? "CheckmarkDoubleCircle" : "UnconfirmedTransaction"}
					dimIcon={isConfirmed ? "CheckmarkDoubleCircle" : "UnconfirmedTransaction"}
					dimensions={[24, 24]}
					className={cn({
						"text-theme-primary-600": !isConfirmed,
						"text-theme-success-600": isConfirmed,
					})}
				/>
			);
		}

		if (activeTab === SendTransferStep.AuthenticationStep) {
			if (wallet?.isLedger()) {
				return (
					<ThemeIcon
						lightIcon="LedgerLight"
						darkIcon="LedgerDark"
						dimIcon="LedgerDim"
						dimensions={[24, 24]}
					/>
				);
			}

			return <ThemeIcon lightIcon="Mnemonic" darkIcon="Mnemonic" dimIcon="Mnemonic" dimensions={[24, 24]} />;
		}

		if (activeTab === SendTransferStep.ReviewStep) {
			return (
				<ThemeIcon
					lightIcon="DocumentView"
					darkIcon="DocumentView"
					dimIcon="DocumentView"
					dimensions={[24, 24]}
				/>
			);
		}

		return (
			<ThemeIcon
				lightIcon="SendTransactionLight"
				darkIcon="SendTransactionDark"
				dimIcon="SendTransactionDim"
				dimensions={[24, 24]}
			/>
		);
	};

	return { getSubtitle, getTitle, getTitleIcon };
};
