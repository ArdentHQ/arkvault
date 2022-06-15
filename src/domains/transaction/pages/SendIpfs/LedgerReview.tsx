import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Circle } from "@/app/components/Circle";
import { Icon } from "@/app/components/Icon";
import { TotalAmountBox } from "@/domains/transaction/components/TotalAmountBox";
import { TransactionDetail } from "@/domains/transaction/components/TransactionDetail";

export const IpfsLedgerReview = ({ wallet }: { wallet: Contracts.IReadWriteWallet }) => {
	const { getValues } = useFormContext();
	const { t } = useTranslation();

	const { fee, hash } = getValues();

	return (
		<>
			<TransactionDetail
				label={t("TRANSACTION.IPFS_HASH")}
				extra={
					<Circle
						className="border-theme-text text-theme-text dark:border-theme-secondary-600 dark:text-theme-secondary-600"
						size="lg"
					>
						<Icon name="Ipfs" size="lg" />
					</Circle>
				}
				border={false}
			>
				<span className="break-all">{hash}</span>
			</TransactionDetail>

			<div className="mt-2">
				<TotalAmountBox amount={0} fee={fee} ticker={wallet.currency()} />
			</div>
		</>
	);
};
