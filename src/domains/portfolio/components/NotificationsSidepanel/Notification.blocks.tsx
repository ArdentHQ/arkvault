import { Contracts } from "@/app/lib/profiles";
import { DTO } from "@/app/lib/mainsail";
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
import { NotificationsEmptyBlock } from "@/app/components/Notifications/NotificationsEmptyBlock";

type Transaction = DTO.RawTransactionData;

export const Notifications = ({
	profile,
	onViewTransactionDetails,
}: {
	profile: Contracts.IProfile;
	onViewTransactionDetails?: (transaction: ExtendedTransactionDTO) => void;
}) => {
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

	return (
		<>
			<div className="mb-3 flex items-center justify-end">
				<Button
					data-testid="MarkAllNotificationsRead"
					disabled={!hasUnread}
					variant="secondary-icon"
					className="w-auto space-x-2 px-2 py-[3px] text-theme-primary-600 disabled:bg-transparent dim:text-theme-dim-navy-600 dark:text-theme-dark-navy-400 dark:disabled:bg-transparent"
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
					className="space-x-2 px-2 py-[3px] text-theme-primary-600 disabled:bg-transparent dim:text-theme-dim-navy-600 dark:text-theme-dark-navy-400 dark:disabled:bg-transparent"
					onClick={() => markAllAsRemoved()}
				>
					<Icon name="Trash" />
					<span className="hidden sm:block">{t("COMMON.REMOVE_ALL")}</span>
				</Button>
			</div>

			{transactions.length > 0 && (
				<div className="space-y-1">
					{transactions.map((transaction) => (
						<Notification
							key={transaction.hash()}
							transaction={transaction}
							isUnread={isNotificationUnread(transaction)}
							onShowDetails={() => {
								onViewTransactionDetails?.(transaction);
							}}
							onMarkAsRead={() => markAsRead(transaction.hash())}
							onRemove={() => markAsRemoved(transaction.hash())}
							isExpanded={expandedNotificationId === transaction.hash()}
							toggleExpand={(id?: string) => setExpandedNotificationId(id)}
						/>
					))}
				</div>
			)}

			{transactions.length === 0 && <NotificationsEmptyBlock />}
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
				data-testid="NotificationRow"
				onClick={() => {
					if (isMdAndAbove) {
						onShowDetails();
						return;
					}
					toggleExpand(isExpanded ? undefined : transaction.hash());
				}}
				onMouseEnter={onMarkAsRead}
				className={cn(
					"group relative my-1 flex cursor-pointer flex-col rounded-[12px] px-2 py-3 hover:bg-theme-secondary-200 dim:hover:bg-theme-dim-700 dark:hover:bg-theme-dark-700 sm:flex-row sm:justify-between sm:gap-14 sm:px-4",
					{
						"bg-theme-secondary-200 dim:bg-theme-dim-700 dark:bg-theme-dark-700": isExpanded,
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
			<div className="divider h-px border-t border-dashed border-theme-secondary-300 last:border-none dim:border-theme-dim-700 dark:border-theme-dark-700" />
		</>
	);
};

export const NotificationLeftSide = ({ transaction }: { transaction: Transaction }): ReactNode => {
	if (!transaction.isSuccess()) {
		return <FailedTransactionNotification transaction={transaction} />;
	}

	if (transaction.isTransfer() || transaction.isMultiPayment() || transaction.isTokenTransfer()) {
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
				className="px-2 py-[3px] text-theme-navy-600 dim:text-theme-dim-navy-600 dark:text-theme-dark-navy-400 sm:hidden"
			>
				{t("COMMON.DETAILS")}
			</Button>
			<Divider
				type="vertical"
				className="border-theme-secondary-400 dim:border-theme-dim-400 dark:border-theme-dark-400 sm:hidden"
			/>
			<Tooltip content={t("COMMON.REMOVE_NOTIFICATION")} placement="top-end">
				<Button
					onClick={(event) => {
						event.stopPropagation();
						onRemove();
					}}
					data-testid={`Notification--delete-`}
					size="icon"
					className="p-1 text-theme-secondary-700 hover:bg-theme-danger-400 hover:text-white dim:text-theme-dim-200 dim-hover:text-white dark:text-theme-secondary-500 dark:hover:text-white"
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
		<div className="ml-9 mt-[5px] flex min-w-24 flex-shrink-0 items-start sm:ml-0 sm:mt-0 sm:justify-end">
			<div className="transition-all duration-200">
				<span
					className={cn(
						"flex items-center gap-2 text-sm font-semibold leading-[17px] text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-dark-200 sm:leading-7",
						{
							"after:inline-flex after:h-2 after:w-2 after:rounded-full after:bg-theme-navy-300 after:content-[''] dim:after:bg-theme-dim-navy-600 dark:after:bg-theme-dark-navy-400 sm:after:hidden":
								isUnread,
							"before:hidden before:h-2 before:w-2 before:rounded-full before:bg-theme-navy-300 before:content-[''] dim:before:bg-theme-dim-navy-600 dark:before:bg-theme-dark-navy-400 sm:before:inline-flex":
								isUnread,
						},
					)}
				>
					<TimeAgo date={DateTime.fromUnix(transaction.timestamp()!.toUNIX()).toISOString()} />
				</span>
			</div>
			<NotificationActions
				onRemove={onRemove}
				className="hidden w-24 bg-[linear-gradient(270deg,#E6EFF9_51.96%,rgba(230,239,249,0)_88.67%)] dim:bg-[linear-gradient(270deg,#283C64_51.96%,rgba(40,60,100,0)_88.67%)] dark:bg-[linear-gradient(270deg,#3D444D_51.96%,rgba(61,68,77,0)_88.67%)] sm:group-hover:flex"
			/>
		</div>
		<NotificationActions
			onRemove={onRemove}
			onDetailsClick={onShowDetails}
			className={cn(
				"min-w-8/12 right-0 w-8/12 bg-[linear-gradient(270deg,#EEF3F5_51.96%,rgba(238,243,245,0)_88.67%)] dim:bg-[linear-gradient(270deg,#283C64_51.96%,rgba(40,60,100,0)_88.67%)] dark:bg-[linear-gradient(270deg,#3D444D_51.96%,rgba(61,68,77,0)_88.67%)]",
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
					className="rounded-lg border border-theme-success-100 bg-theme-success-100 p-[3px] text-theme-success-700 dim:border-theme-success-700 dim:bg-transparent dim:text-theme-success-500 dark:border-theme-success-700 dark:bg-transparent dark:text-theme-success-500"
				/>
			</div>
			<div className="text-sm leading-[21px] text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-dark-200 sm:text-base sm:leading-7">
				<Trans
					i18nKey={`COMMON.NOTIFICATIONS.${translationKey}`}
					components={{
						Address: (
							<span className="font-semibold text-theme-secondary-900 dim:text-theme-dim-50 dark:text-theme-dark-50">
								{transaction.wallet().alias()}
							</span>
						),
						Amount: (
							<span className="font-semibold text-theme-success-700 dim:text-theme-success-500 dark:text-theme-success-500">
								{transaction.convertedAmount()}
							</span>
						),
					}}
				/>
			</div>
		</div>
	);
};

export const FailedTransactionNotification = ({ transaction }: { transaction: Transaction }) => {
	const receipt = transaction.data().receipt();

	return (
		<div className="flex items-start gap-3">
			<div className="flex h-7 items-end">
				<Icon
					name="CircleCross"
					className="rounded-lg border border-theme-danger-100 bg-theme-danger-100 p-[3px] text-theme-danger-700 dim:border-theme-danger-400 dim:bg-transparent dim:text-theme-danger-400 dark:border-theme-danger-400 dark:bg-transparent dark:text-theme-danger-400"
				/>
			</div>
			<div className="text-sm leading-[21px] text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-dark-200 sm:text-base sm:leading-7">
				<Trans
					i18nKey={
						receipt.hasUnknownError()
							? `COMMON.NOTIFICATIONS.FAILED_TRANSACTION_GENERIC_NOTIFICATION`
							: `COMMON.NOTIFICATIONS.FAILED_TRANSACTION_NOTIFICATION`
					}
					components={{
						Error: <span>{receipt.prettyError()}</span>,
						TransactionId: (
							<TruncateMiddle
								className="font-semibold text-theme-secondary-900 dim:text-theme-dim-50 dark:text-theme-dark-50"
								text={transaction.hash()}
							/>
						),
					}}
				/>
			</div>
		</div>
	);
};
