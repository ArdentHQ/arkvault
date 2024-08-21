import cn from "classnames"
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React, { Children } from "react";
import { useTranslation } from "react-i18next";

import { MultiSignatureSuccessful } from "./MultiSignatureSuccessful";
import { useConfirmedTransaction } from "./hooks/useConfirmedTransaction";
import { TransactionAddresses, TransactionFee, TransactionType } from "@/domains/transaction/components/TransactionDetail";
import { StepHeader } from "@/app/components/StepHeader";
import { Spinner } from "@/app/components/Spinner";
import { Icon } from "@/app/components/Icon";
import { useFormContext } from "react-hook-form";
import { DetailWrapper, DetailLabel } from "@/app/components/DetailWrapper";
import { Divider } from "@/app/components/Divider";
import { TransactionId } from "../TransactionDetail/TransactionId";

interface TransactionSuccessfulProperties {
	transaction: DTO.ExtendedSignedTransactionData;
	senderWallet: Contracts.IReadWriteWallet;
	title?: string;
	description?: string;
	children?: React.ReactNode;
}

export const TransactionDetailPadded = ({ children }: { children: React.ReactNode }) => (
	<div className="flex group">
		<div className="sm:flex hidden sm:ml-3">
			<div className="flex-row pr-3 min-w-9">
				<div className="w-full h-6 border-l-2 border-b-2 rounded-bl-xl border-theme-secondary-300 dark:border-theme-secondary-800 -mt-2" />
				<div className="w-full h-[110%] border-l-2 border-theme-secondary-300 dark:border-theme-secondary-800 group-last:hidden" />
			</div>
		</div>
		<div className="sm:flex-row w-full">{children}</div>
	</div>
)

export const TransactionSuccessful = ({
	transaction,
	senderWallet,
	title,
	children,
}: TransactionSuccessfulProperties) => {
	const { t } = useTranslation();

	const { isConfirmed, confirmations } = useConfirmedTransaction({ transactionId: transaction.id(), wallet: senderWallet });
	const { getValues } = useFormContext()
	const { recipients } = getValues()

	if (transaction.isMultiSignatureRegistration() || transaction.usesMultiSignature()) {
		return (
			<MultiSignatureSuccessful transaction={transaction} senderWallet={senderWallet}>
				<TransactionFee currency={senderWallet.currency()} value={transaction.fee()} paddingPosition="top" />
			</MultiSignatureSuccessful>
		);
	}

	const titleText =
		title ?? (isConfirmed ? t("TRANSACTION.SUCCESS.CONFIRMED") : t("TRANSACTION.PENDING.TITLE"));

	return (
		<section
			data-testid={isConfirmed ? "TransactionSuccessful" : "TransactionPending"}
			className="space-y-8"
		>
			<StepHeader title={titleText}
				titleIcon={
					<Icon
						dimensions={[24, 24]}
						name={isConfirmed ? "CheckmarkDoubleCircle" : "PendingTransaction"}
						data-testid="icon-PendingTransaction"
						className={cn({
							"text-theme-primary-600": !isConfirmed,
							"text-theme-success-600": isConfirmed
						})}
					/>
				}
			/>

			<TransactionId transaction={transaction} />

			<TransactionDetailPadded>
				<TransactionAddresses senderWallet={senderWallet} recipients={recipients} profile={senderWallet.profile()} />
			</TransactionDetailPadded>

			<TransactionDetailPadded>
				<TransactionType type={transaction.type()} />
			</TransactionDetailPadded>

			{children}

			<TransactionDetailPadded>
				<DetailLabel>{t("TRANSACTION.CONFIRMATIONS")}</DetailLabel>
				<div className="mt-2">
					{!isConfirmed && (
						<div
							data-testid="PendingConfirmationAlert"
							className="flex items-center space-x-3 rounded-xl border border-theme-warning-200 bg-theme-warning-50 px-6 py-5 dark:border-theme-warning-600 dark:bg-transparent"
						>
							<Spinner color="warning-alt" size="sm" width={3} />
							<Divider type="vertical" className="text-theme-warning-200 dark:text-theme-secondary-800" />
							<p className="font-semibold text-theme-secondary-700 dark:text-theme-warning-600">
								{t("TRANSACTION.PENDING.STATUS_TEXT")}
							</p>
						</div>
					)}

					{isConfirmed && (
						<div
							data-testid="TransactionSuccessAlert"
							className="flex items-center space-x-3 rounded-xl border border-theme-success-200 bg-theme-success-50 px-6 py-5 dark:border-theme-success-600 dark:bg-transparent"
						>
							<div className="flex items-center space-x-2 text-theme-success-600">
								<Icon name="CheckmarkDouble" />
								<p>{t("COMMON.ALERT.SUCCESS")}</p>
							</div>

							<Divider type="vertical" className="text-theme-success-200 dark:text-theme-secondary-800" />

							<p className="font-semibold text-theme-secondary-700 dark:text-theme-success-600">
								<span>{t("TRANSACTION.CONFIRMATIONS_COUNT", { count: confirmations })} </span>
							</p>
						</div>
					)}
				</div>
			</TransactionDetailPadded>
		</section>
	);
};
