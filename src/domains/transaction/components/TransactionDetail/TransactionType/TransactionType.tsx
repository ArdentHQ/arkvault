import React from "react";
import { useTranslation } from "react-i18next";

import { useTransactionTypes } from "@/domains/transaction/hooks/use-transaction-types";
import { DetailLabelText, DetailWrapper } from "@/app/components/DetailWrapper";
import { Label } from "@/app/components/Label";
import { DTO } from "@ardenthq/sdk-profiles";
import { Divider } from "@/app/components/Divider";

export const TransactionType = ({ transaction }: { transaction: DTO.ExtendedSignedTransactionData }) => {
	const { t } = useTranslation();

	const { getLabel } = useTransactionTypes();

	return (
		<div data-testid="TransactionType">
			<DetailWrapper label={t("TRANSACTION.TRANSACTION_TYPE")}>
				<div className="flex w-full justify-between sm:justify-start">
					<DetailLabelText minWidth="md">{t("COMMON.CATEGORY")}</DetailLabelText>
					<Label color="neutral" size="xs">
						{getLabel(transaction.type())}
					</Label>
				</div>

				{[transaction.isDelegateRegistration(), transaction.isDelegateResignation()].some(Boolean) && (
					<>
						<div className="hidden h-8 w-full items-center md:flex">
							<Divider dashed />
						</div>

						<div className="flex w-full justify-between sm:justify-start">
							<DetailLabelText minWidth="md">{t("COMMON.DELEGATE")}</DetailLabelText>
							<div> {transaction.username()} </div>
						</div>
					</>
				)}
			</DetailWrapper>
		</div>
	);
};
