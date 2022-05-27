import React from "react";
import { useTranslation } from "react-i18next";

import { Amount } from "@/app/components/Amount";
import {
	TransactionDetail,
	TransactionDetailProperties,
} from "@/domains/transaction/components/TransactionDetail/TransactionDetail";

type TransactionFeeProperties = {
	currency: string;
	value: number;
	exchangeCurrency?: string;
	convertedValue?: number;
} & TransactionDetailProperties;

const TransactionFee: React.FC<TransactionFeeProperties> = ({
	currency,
	value,
	exchangeCurrency,
	convertedValue,
	borderPosition = "top",
	...properties
}: TransactionFeeProperties) => {
	const { t } = useTranslation();

	return (
		<TransactionDetail
			data-testid="TransactionFee"
			label={t("TRANSACTION.TRANSACTION_FEE")}
			borderPosition={borderPosition}
			{...properties}
		>
			<Amount ticker={currency} value={value} />

			{!!exchangeCurrency && !!convertedValue && (
				<Amount ticker={exchangeCurrency} value={convertedValue} className="ml-2 text-theme-secondary-400" />
			)}
		</TransactionDetail>
	);
};

export { TransactionFee };
