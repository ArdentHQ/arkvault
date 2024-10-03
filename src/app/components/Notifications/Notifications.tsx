import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useNotifications } from "./hooks/use-notifications";
import { NotificationsProperties } from "./Notifications.contracts";
import { EmptyBlock } from "@/app/components/EmptyBlock";
import { Image } from "@/app/components/Image";
import { useEnvironmentContext } from "@/app/contexts";
import { NotificationTransactionsTable } from "@/domains/transaction/components/TransactionTable/NotificationTransactionsTable";
import { Button } from "@/app/components/Button";

export const Notifications = ({ profile, onTransactionClick }: NotificationsProperties) => {
	const { t } = useTranslation();
	const { persist } = useEnvironmentContext();

	const { transactions, markAllTransactionsAsRead, hasUnread } = useNotifications({ profile });

	useEffect(() => {
		markAllTransactionsAsRead(true);
		persist();
	}, []);

	return (
		<div className="w-full sm:w-[35rem]" data-testid="NotificationsWrapper">
			<div className="flex w-full items-center justify-between rounded-t-xl bg-theme-secondary-100 px-6 py-4 dark:bg-black sm:px-8">
				<div className="hidden text-lg font-semibold text-theme-secondary-900 dark:text-theme-secondary-200 sm:block">
					Notification
				</div>
				<Button
					variant="transparent"
					size="2xs"
					icon="CheckmarkDoubleCircle"
					disabled={!hasUnread}
					className="p-0 text-theme-secondary-800 disabled:text-theme-secondary-500 dark:text-theme-secondary-800 dark:disabled:text-theme-secondary-800"
					onClick={() => markAllTransactionsAsRead(true)}
				>
					<span>{t("COMMON.NOTIFICATIONS.MARK_ALL_AS_READ")}</span>
				</Button>
			</div>

			{transactions.length === 0 && (
				<div className="px-6 pb-8 pt-4">
					<EmptyBlock className="py-4">
						<span className="whitespace-nowrap">{t("COMMON.NOTIFICATIONS.EMPTY")}</span>
					</EmptyBlock>
					<Image name="EmptyNotifications" className="mx-auto mb-2 mt-8 w-64" />
				</div>
			)}

			{transactions.length > 0 && (
				<div
					className="max-h-[36rem] w-full overflow-y-hidden overscroll-y-none"
					data-testid="NotificationsWrapper"
				>
					{transactions.length > 0 && (
						<NotificationTransactionsTable
							profile={profile}
							isLoading={profile.notifications().transactions().isSyncing() || transactions.length === 0}
							transactions={transactions}
							onClick={onTransactionClick}
						/>
					)}
				</div>
			)}
		</div>
	);
};
