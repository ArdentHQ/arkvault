import React, { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DTO } from "@/app/lib/mainsail";
import { Contracts } from "@/app/lib/profiles";
import { DetailDivider, DetailLabelText, DetailWrapper } from "@/app/components/DetailWrapper";
import { useTimeFormat } from "@/app/hooks/use-time-format";
import { Link } from "@/app/components/Link";
import { useBlockHeight } from "@/domains/transaction/hooks/use-block-height";
import { DateTime } from "@/app/lib/intl/datetime";

export const TransactionDetails = ({
	transaction: initialTransaction,
	labelClassName,
	isConfirmed,
}: {
	transaction: DTO.RawTransactionData;
	labelClassName?: string;
	isConfirmed?: boolean;
}): ReactElement => {
	const { t } = useTranslation();
	const format = useTimeFormat();

	const transactionWallet: Contracts.IReadWriteWallet = initialTransaction.wallet();
	const [transaction, setTransaction] = useState<DTO.RawTransactionData>(initialTransaction);

	useEffect(() => {
		// if it is a confirmed transaction, there is no need to refresh it
		if (transaction.isConfirmed()) {
			return;
		}

		// if `isConfirmed` is false, and transaction is not confirmed we probably need to wait
		if (!isConfirmed) {
			return;
		}

		const refreshTransaction = async () => {
			const confirmedTransaction = await transactionWallet.client().transaction(transaction.hash());
			setTransaction(confirmedTransaction);
		};

		void refreshTransaction();
	}, [isConfirmed, transaction, transactionWallet]);

	const timestamp = DateTime.make(
		transaction.timestamp(),
		"en",
		Intl.DateTimeFormat().resolvedOptions().timeZone,
	).format(format);

	const { blockHeight } = useBlockHeight({
		blockHash: transaction.blockHash(),
		network: transactionWallet.network(),
	});

	return (
		<DetailWrapper label={t("TRANSACTION.TRANSACTION_DETAILS")}>
			<div className="space-y-3 sm:space-y-0">
				<div className="flex justify-between w-full sm:justify-start">
					<DetailLabelText className={labelClassName}>{t("COMMON.TIMESTAMP")}</DetailLabelText>
					<div className="text-sm font-semibold sm:text-base sm:leading-5 leading-[17px]">{timestamp}</div>
				</div>

				<DetailDivider />

				<div className="flex justify-between w-full sm:justify-start">
					<DetailLabelText className={labelClassName}>{t("COMMON.BLOCK")}</DetailLabelText>
					{transaction.blockHash() && (
						<Link
							isExternal
							to={transactionWallet.link().block(transaction.blockHash())}
							className="h-5 text-sm sm:text-base sm:leading-5 leading-[17px]"
						>
							{blockHeight}
						</Link>
					)}

					{!transaction.blockHash() && (
						<p className="text-sm sm:text-base sm:leading-5 text-theme-secondary-500 leading-[17px]">
							{t("COMMON.NOT_AVAILABLE")}
						</p>
					)}
				</div>

				<DetailDivider />

				<div className="flex justify-between w-full sm:justify-start">
					<DetailLabelText className={labelClassName}>{t("COMMON.NONCE")}</DetailLabelText>
					<div className="text-sm font-semibold sm:text-base sm:leading-5 leading-[17px]">
						{transaction.nonce().toString()}
					</div>
				</div>
			</div>
		</DetailWrapper>
	);
};
