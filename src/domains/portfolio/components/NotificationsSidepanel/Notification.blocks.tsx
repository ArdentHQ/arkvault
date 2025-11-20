import { DTO, Contracts } from "@/app/lib/profiles";
import React, { ReactNode, useEffect, useState } from "react";
import { Icon } from "@/app/components/Icon";
import { Trans, useTranslation } from "react-i18next";
import { TruncateMiddle } from "@/app/components/TruncateMiddle";
import cn from "classnames";
import { DateTime } from "@/app/lib/intl";
import { TimeAgo } from "@/app/components/TimeAgo";
import { Button } from "@/app/components/Button";
import { Divider } from "@/app/components/Divider";
import { useBreakpoint } from "@/app/hooks";
import { useNotifications } from "@/app/components/Notifications";
import { Tooltip } from "@/app/components/Tooltip";
import { ExtendedTransactionDTO } from "@/domains/transaction/components/TransactionTable";
import { TransactionDetailSidePanel } from "@/domains/transaction/components/TransactionDetailSidePanel";

type Transaction = DTO.ExtendedConfirmedTransactionData;

export const Notifications = ({ profile }: { profile: Contracts.IProfile }) => {
	const { t } = useTranslation();
	const {
		transactions,
		isNotificationUnread,
		markAsRemoved,
		markAsRead,
		markAllAsRemoved,
		markAllAsRead,
		hasUnread,
	} = useNotifications({ profile });
	const [expandedNotificationId, setExpandedNotificationId] = useState<string | undefined>(undefined);
	const [transactionModalItem, setTransactionModalItem] = useState<ExtendedTransactionDTO | undefined>(undefined);

	return (
		<>
			<div className="mb-3 flex items-center justify-end">
				<Button
					data-testid="WalletVote__button"
					disabled={!hasUnread}
					variant="secondary-icon"
					className="text-theme-primary-600 dark:text-theme-dark-navy-400 dim:text-theme-dim-navy-600 mt-4 hidden w-full space-x-2 disabled:bg-transparent md:mt-0 md:flex md:w-auto md:px-2 md:py-[3px] dark:disabled:bg-transparent"
					onClick={() => markAllAsRead()}
				>
					<Icon name="CheckmarkDouble" />
					<span>{t("COMMON.NOTIFICATIONS.MARK_ALL_AS_READ")}</span>
				</Button>
				<Divider type="vertical" />
				<Button
					data-testid="WalletVote__button"
					disabled={transactions.length === 0}
					variant="secondary-icon"
					className="text-theme-primary-600 dark:text-theme-dark-navy-400 dim:text-theme-dim-navy-600 mt-4 hidden w-full space-x-2 disabled:bg-transparent md:mt-0 md:flex md:w-auto md:px-2 md:py-[3px] dark:disabled:bg-transparent"
					onClick={() => markAllAsRemoved()}
				>
					<Icon name="Trash" />
					<span>{t("COMMON.REMOVE_ALL")}</span>
				</Button>
			</div>
			<div className="space-y-1">
				{transactions.map((transaction) => (
					<Notification
						key={transaction.hash()}
						transaction={transaction}
						isUnread={isNotificationUnread(transaction)}
						onShowDetails={() => {
							setTransactionModalItem(transaction);
						}}
						onMarkAsRead={() => markAsRead(transaction.hash())}
						onRemove={() => markAsRemoved(transaction.hash())}
						isExpanded={expandedNotificationId === transaction.hash()}
						toggleExpand={(id?: string) => setExpandedNotificationId(id)}
					/>
				))}
			</div>

			{transactionModalItem && (
				<TransactionDetailSidePanel
					isOpen
					transactionItem={transactionModalItem}
					profile={profile}
					onClose={() => {
						setTransactionModalItem(undefined);
					}}
				/>
			)}
		</>
	);
};

interface NotificationProperties {
	transaction: Transaction;
	isUnread: boolean;
	onShowDetails: () => void;
	onMarkAsRead: () => void;
	onRemove: () => void;
	isExpanded: boolean;
	toggleExpand: (id?: string) => void;
}

export const Notification = ({
	transaction,
	isUnread,
	onShowDetails,
	onMarkAsRead,
	isExpanded,
	toggleExpand,
	onRemove,
}: NotificationProperties): ReactNode => {
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
						onShowDetails();
						return;
					}
					toggleExpand(isExpanded ? undefined : transaction.hash());
				}}
				onMouseEnter={onMarkAsRead}
				className={cn(
					"group hover:bg-theme-secondary-200 dark:hover:bg-theme-dark-700 dim:hover:bg-theme-dim-700 relative my-1 flex cursor-pointer flex-col rounded-[12px] px-2 py-3 sm:flex-row sm:justify-between sm:gap-14 sm:px-4",
					{
						"bg-theme-secondary-200 dark:bg-theme-dark-700 dim:bg-theme-dim-700": isExpanded,
					},
				)}
			>
				<NotificationLeftSide transaction={transaction} />
				<NotificationRightSide
					transaction={transaction}
					isUnread={isUnread}
					isExpanded={isExpanded}
					onShowDetails={onShowDetails}
					onRemove={onRemove}
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

	return <></>;
};

const NotificationActions = ({
	className,
	onRemove,
	onDetailsClick,
}: {
	className?: string;
	onDetailsClick?: () => void;
	onRemove: () => void;
}) => {
	const { t } = useTranslation();

	return (
		<div
			className={cn(
				"absolute -my-3 h-full items-center justify-end gap-1 self-center rounded-[12px] px-2 py-3 transition-all duration-200 sm:-mx-4 sm:px-4",
				className,
			)}
		>
			<Button
				variant="primary-transparent"
				onClick={(event) => {
					event.stopPropagation();
					onDetailsClick?.();
				}}
				className="text-theme-navy-600 dark:text-theme-dark-navy-400 dim:text-theme-dim-navy-600 px-2 py-[3px] sm:hidden"
			>
				{t("COMMON.DETAILS")}
			</Button>
			<Divider
				type="vertical"
				className="border-theme-secondary-400 dark:border-theme-dark-400 dim:border-theme-dim-400 sm:hidden"
			/>
			<Tooltip content={t("COMMON.REMOVE_NOTIFICATION")} placement="top-end">
				<Button
					onClick={(event) => {
						event.stopPropagation();
						onRemove();
					}}
					data-testid={`Notification--delete-`}
					size="icon"
					className="text-theme-secondary-700 dark:text-theme-secondary-500 dim:text-theme-dim-200 hover:bg-theme-danger-400 dim-hover:text-white p-1 hover:text-white dark:hover:text-white"
					variant="transparent"
				>
					<Icon name="Trash" dimensions={[16, 16]} />
				</Button>
			</Tooltip>
		</div>
	);
};

export const NotificationRightSide = ({
	transaction,
	isUnread,
	isExpanded,
	onShowDetails,
	onRemove,
}: {
	transaction: Transaction;
	isUnread: boolean;
	isExpanded: boolean;
	onShowDetails: () => void;
	onRemove: () => void;
}) => (
	<>
		<div className="mt-[5px] ml-9 flex min-w-24 flex-shrink-0 items-start sm:mt-0 sm:ml-0 sm:justify-end">
			<div className="transition-all duration-200">
				<span
					className={cn(
						"text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 flex items-center gap-2 text-sm leading-[17px] font-semibold sm:leading-7",
						{
							"after:bg-theme-navy-300 dark:after:bg-theme-dark-navy-400 dim:after:bg-theme-dim-navy-600 after:inline-flex after:h-2 after:w-2 after:rounded-full after:content-[''] sm:after:hidden":
								isUnread,
							"before:bg-theme-navy-300 dark:before:bg-theme-dark-navy-400 dim:before:bg-theme-dim-navy-600 before:hidden before:h-2 before:w-2 before:rounded-full before:content-[''] sm:before:inline-flex":
								isUnread,
						},
					)}
				>
					<TimeAgo date={DateTime.fromUnix(transaction.timestamp()!.toUNIX()).toISOString()} />
				</span>
			</div>
			<NotificationActions
				onRemove={onRemove}
				className="dim:bg-[linear-gradient(270deg,#283C64_51.96%,rgba(40,60,100,0)_88.67%)] hidden w-24 bg-[linear-gradient(270deg,#E6EFF9_51.96%,rgba(230,239,249,0)_88.67%)] sm:group-hover:flex dark:bg-[linear-gradient(270deg,#3D444D_51.96%,rgba(61,68,77,0)_88.67%)]"
			/>
		</div>
		<NotificationActions
			onRemove={onRemove}
			onDetailsClick={onShowDetails}
			className={cn(
				"dim:bg-[linear-gradient(270deg,#283C64_51.96%,rgba(40,60,100,0)_88.67%)] right-0 w-8/12 min-w-8/12 bg-[linear-gradient(270deg,#EEF3F5_51.96%,rgba(238,243,245,0)_88.67%)] dark:bg-[linear-gradient(270deg,#3D444D_51.96%,rgba(61,68,77,0)_88.67%)]",
				{
					flex: isExpanded,
					hidden: !isExpanded,
				},
			)}
		/>
	</>
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
					className="bg-theme-success-100 border-theme-success-100 dark:border-theme-success-700 dark:text-theme-success-500 dim:bg-transparent dim:border-theme-success-700 dim:text-theme-success-500 text-theme-success-700 rounded-lg border p-[3px] dark:bg-transparent"
				/>
			</div>
			<div className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 text-sm leading-[21px] sm:text-base sm:leading-7">
				<Trans
					i18nKey={`COMMON.NOTIFICATIONS.${translationKey}`}
					components={{
						Address: (
							<span className="text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-50 font-semibold">
								{transaction.wallet().alias()}
							</span>
						),
						Amount: (
							<span className="text-theme-success-700 dark:text-theme-success-500 dim:text-theme-success-500 font-semibold">
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
			<Icon
				name="CircleCross"
				className="bg-theme-danger-100 text-theme-danger-700 border-theme-danger-100 dark:border-theme-danger-400 dark:text-theme-danger-400 dim:bg-transparent dim:border-theme-danger-400 dim:text-theme-danger-400 rounded-lg border p-[3px] dark:bg-transparent"
			/>
		</div>
		<div className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 text-sm leading-[21px] sm:text-base sm:leading-7">
			<Trans
				i18nKey={`COMMON.NOTIFICATIONS.FAILED_TRANSACTION_NOTIFICATION`}
				components={{
					Error: <span>error message should go here</span>,
					TransactionId: (
						<TruncateMiddle
							className="text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-50 font-semibold"
							text={transaction.hash()}
						/>
					),
				}}
			/>
		</div>
	</div>
);
