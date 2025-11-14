import { DTO } from "@/app/lib/profiles";
import React from "react";
import { Icon } from "@/app/components/Icon";
import { Trans } from "react-i18next";
import { TruncateMiddle } from "@/app/components/TruncateMiddle";
import cn from "classnames";
import { DateTime } from "@/app/lib/intl";
import { TimeAgo } from "@/app/components/TimeAgo";

type Transaction = DTO.ExtendedConfirmedTransactionData;

export const Notification = ({ transaction, isRead }: { transaction: Transaction; isRead: boolean }) => (
	<>
		<div className="hover:bg-theme-secondary-200 my-1 flex cursor-pointer flex-col rounded-[12px] py-3 sm:flex-row sm:justify-between sm:gap-14 sm:px-4">
			<NotificationLeftSide transaction={transaction} />
			<NotificationRightSide transaction={transaction} isRead={isRead} />
		</div>
		<div className="border-theme-secondary-300 divider dark:border-theme-dark-700 dim:border-theme-dim-700 h-px border-t border-dashed last:border-none" />
	</>
);

export const NotificationLeftSide = ({ transaction }: { transaction: Transaction }) => {
	if (!transaction.isSuccess()) {
		return <FailedTransactionNotification transaction={transaction} />;
	}

	if (transaction.isTransfer() || transaction.isMultiPayment()) {
		return <TransferNotification transaction={transaction} />;
	}

	return null;
};

export const NotificationRightSide = ({ transaction, isRead }: { transaction: Transaction; isRead: boolean }) => (
	<div className="mt-[5px] ml-9 flex flex-shrink-0 items-start sm:mt-0 sm:ml-0">
		<span
			className={cn(
				"text-theme-secondary-700 flex items-center gap-2 text-sm leading-[21px] font-semibold sm:leading-7",
				{
					"after:bg-theme-navy-300 after:inline-flex after:h-2 after:w-2 after:rounded-full after:content-[''] sm:after:hidden":
						isRead,
					"before:bg-theme-navy-300 before:hidden before:h-2 before:w-2 before:rounded-full before:content-[''] sm:before:inline-flex":
						isRead,
				},
			)}
		>
			<TimeAgo date={DateTime.fromUnix(transaction.timestamp()?.toUNIX()).toISOString()} />
		</span>
	</div>
);

export const TransferNotification = ({ transaction }: { transaction: Transaction }) => {
	const translationKey = transaction.isMultiPayment()
		? "TRANSFER_MULTIPAYMENT_NOTIFICATION"
		: "TRANSFER_NOTIFICATION";

	return (
		<div className="flex items-start gap-3">
			<div className="flex sm:h-7 sm:items-end">
				<Icon
					name="DoubleArrowLeftDashed"
					className="bg-theme-success-100 text-theme-success-700 rounded-lg p-1"
				/>
			</div>
			<div className="text-theme-secondary-700 leading-[21px] sm:leading-7">
				<Trans
					i18nKey={`COMMON.NOTIFICATIONS.${translationKey}`}
					components={{
						Address: (
							<span className="text-theme-secondary-900 font-semibold">
								{transaction.wallet().alias()}
							</span>
						),
						Amount: (
							<span className="text-theme-success-700 font-semibold">
								{transaction.convertedAmount()}
							</span>
						),
					}}
				/>
			</div>
		</div>
	);
};

export const FailedTransactionNotification = ({ transaction }: { transaction: Transaction }) => (
	<div className="flex items-start gap-3">
		<div className="flex h-7 items-end">
			<Icon name="CircleCross" className="bg-theme-danger-100 text-theme-danger-700 rounded-lg p-1" />
		</div>
		<div className="text-theme-success-700 leading-[21px] sm:leading-7">
			<Trans
				i18nKey={`COMMON.NOTIFICATIONS.FAILED_TRANSACTION_NOTIFICATION`}
				components={{
					Error: <span>{transaction.explorerLink()}</span>,
					TransactionId: (
						<TruncateMiddle className="text-theme-secondary-900 font-semibold" text={transaction.hash()} />
					),
				}}
			/>
		</div>
	</div>
);
