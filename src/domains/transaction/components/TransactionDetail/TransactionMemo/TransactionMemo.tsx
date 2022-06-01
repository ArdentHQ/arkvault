import React from "react";
import { useTranslation } from "react-i18next";

import { Icon } from "@/app/components/Icon";
import { TransactionDetail } from "@/domains/transaction/components/TransactionDetail/TransactionDetail";

interface TransactionMemoProperties {
	memo?: string;
}

export const TransactionMemo = ({ memo }: TransactionMemoProperties) => {
	const { t } = useTranslation();

	return (
		<TransactionDetail
			data-testid="TransactionMemo"
			label={t("TRANSACTION.MEMO")}
			extra={
				<div className="flex justify-center text-theme-secondary-900 dark:text-theme-secondary-600 md:px-3">
					<Icon name="FileLines" size="lg" />
				</div>
			}
		>
			<p className="whitespace-pre-line break-all">{memo}</p>
		</TransactionDetail>
	);
};
