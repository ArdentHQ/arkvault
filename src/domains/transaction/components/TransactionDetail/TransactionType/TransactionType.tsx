import React from "react";
import { useTranslation } from "react-i18next";

import { useTransactionTypes } from "@/domains/transaction/hooks/use-transaction-types";
import { DetailLabelText, DetailWrapper } from "@/app/components/DetailWrapper";
import { Label } from "@/app/components/Label";

export const TransactionType = ({ type }: { type: string }) => {
	const { t } = useTranslation();

	const { getLabel } = useTransactionTypes();

	return (
		<div data-testid="TransactionType">
			<DetailWrapper label={t("TRANSACTION.TRANSACTION_TYPE")}>
				<div className="flex w-full justify-between sm:justify-start">
					<DetailLabelText minWidth="sm">{t("COMMON.CATEGORY")}</DetailLabelText>
					<Label color="neutral" size="xs">{getLabel(type)}</Label>
				</div>
			</DetailWrapper>
		</div>
	);
};
