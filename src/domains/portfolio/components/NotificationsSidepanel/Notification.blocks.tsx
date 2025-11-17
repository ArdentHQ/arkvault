import { DTO, Contracts } from "@/app/lib/profiles";
import React, { ReactNode, useEffect, useState } from "react";
import { Icon } from "@/app/components/Icon";
import { Trans } from "react-i18next";
import { TruncateMiddle } from "@/app/components/TruncateMiddle";
import cn from "classnames";
import { DateTime } from "@/app/lib/intl";
import { TimeAgo } from "@/app/components/TimeAgo";
import { Button } from "@/app/components/Button";
import { Divider } from "@/app/components/Divider";
import { useBreakpoint } from "@/app/hooks";
import { useNotifications } from "@/app/components/Notifications";

type Transaction = DTO.ExtendedConfirmedTransactionData;

export const Notifications = ({ profile }: { profile: Contracts.IProfile }) => {
	const { transactions, isNotificationUnread } = useNotifications({ profile });
	const [expandedNotificationId, setExpandedNotificationId] = useState<string | undefined>(undefined);

	return (
		<div className="space-y-1">
			{transactions.map((transaction) => (
				<Notification
					transaction={transaction}
					isRead={!isNotificationUnread(transaction)}
					onShowDetails={(hash) => console.log("show transaction details", hash)}
					onMarkAsRead={(hash) => console.log("notification hovered over", hash)}
					isExpanded={expandedNotificationId === transaction.hash()}
					toggleExpand={(id?: string) => setExpandedNotificationId(id)}
				/>
			))}
		</div>
	);
};

export const Notification = ({
	transaction,
	isRead,
	onShowDetails,
	onMarkAsRead,
	isExpanded,
	toggleExpand,
}: {
	transaction: Transaction;
	isRead: boolean;
	onShowDetails: (hash: string) => void;
	onMarkAsRead: (hash: string) => void;
	isExpanded: boolean;
	toggleExpand: (id?: string) => void;
}): ReactNode => {
	const { isMdAndAbove } = useBreakpoint();

	useEffect(() => {
		if (isMdAndAbove) {
			toggleExpand();
		}
	}, [isMdAndAbove]);

	return (
		<>
			<div
				onClick={() => {
					if (isMdAndAbove) {
						onShowDetails(transaction.hash());
						return;
					}
					toggleExpand(isExpanded ? undefined : transaction.hash());
				}}
				onMouseEnter={() => onMarkAsRead(transaction.hash())}
				className={cn(
					"group hover:bg-theme-secondary-200 relative my-1 flex cursor-pointer flex-col rounded-[12px] py-3 sm:flex-row sm:justify-between sm:gap-14 sm:px-4",
					{
						"bg-theme-secondary-200": isExpanded,
					},
				)}
			>
				<NotificationLeftSide transaction={transaction} />
				<NotificationRightSide
					transaction={transaction}
					isRead={isRead}
					isExpanded={isExpanded}
					onShowDetails={() => onShowDetails(transaction.hash())}
				/>
			</div>
			<div className="border-theme-secondary-300 divider dark:border-theme-dark-700 dim:border-theme-dim-700 h-px border-t border-dashed last:border-none" />
		</>
	);
};

export const NotificationLeftSide = ({ transaction }: { transaction: Transaction }): ReactNode => {
	if (!transaction.isSuccess()) {
		return <FailedTransactionNotification transaction={transaction} />;
	}

	if (transaction.isTransfer() || transaction.isMultiPayment()) {
		return <TransferNotification transaction={transaction} />;
	}

	return null;
};

const NotificationActions = ({ className, onDetailsClick }: { className?: string; onDetailsClick?: () => void }) => (
	<div
		className={cn(
			"absolute -my-3 h-full items-center justify-end gap-1 self-center rounded-[12px] px-4 py-3 transition-all duration-200 sm:-mx-4",
			className,
		)}
	>
		<Button
			variant="primary-transparent"
			onClick={(event) => {
				event.stopPropagation();
				onDetailsClick?.();
			}}
			className="text-theme-navy-600 px-2 py-[3px] sm:hidden"
		>
			Details
		</Button>
		<Divider
			type="vertical"
			className="border-theme-secondary-400 dark:border-theme-secondary-800 dim:border-theme-dim-700 sm:hidden"
		/>
		<Button
			data-testid={`Notification--delete-`}
			size="icon"
			className="text-theme-secondary-700 dark:text-theme-secondary-500 dim:text-theme-dim-200 hover:bg-theme-danger-400 dim-hover:text-white p-1 hover:text-white dark:hover:text-white"
			variant="transparent"
		>
			<Icon name="Trash" dimensions={[16, 16]} />
		</Button>
	</div>
);

export const NotificationRightSide = ({
	transaction,
	isRead,
	isExpanded,
	onShowDetails,
}: {
	transaction: Transaction;
	isRead: boolean;
	isExpanded: boolean;
	onShowDetails: () => void;
}) => {
	return (
		<>
			<div className="mt-[5px] ml-9 flex min-w-24 flex-shrink-0 items-start sm:mt-0 sm:ml-0 sm:justify-end">
				<div className="transition-all duration-200">
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
				<NotificationActions className="hidden w-24 bg-[linear-gradient(270deg,#E6EFF9_51.96%,rgba(230,239,249,0)_88.67%)] sm:group-hover:flex" />
			</div>
			<NotificationActions
				className={cn(
					"right-0 w-8/12 min-w-8/12 bg-[linear-gradient(270deg,#EEF3F5_51.96%,rgba(238,243,245,0)_88.67%)]",
					{
						flex: isExpanded,
						hidden: !isExpanded,
					},
				)}
				onDetailsClick={onShowDetails}
			/>
		</>
	);
};

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
					Error: <span>error message should go here</span>,
					TransactionId: (
						<TruncateMiddle className="text-theme-secondary-900 font-semibold" text={transaction.hash()} />
					),
				}}
			/>
		</div>
	</div>
);
