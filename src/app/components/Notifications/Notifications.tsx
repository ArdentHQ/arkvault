import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { useNotifications } from "./hooks/use-notifications";
import { NotificationItemProperties, NotificationsProperties } from "./Notifications.contracts";
import { EmptyBlock } from "@/app/components/EmptyBlock";
import { Image } from "@/app/components/Image";
import { useEnvironmentContext } from "@/app/contexts";
import { NotificationTransactionsTable } from "@/domains/transaction/components/TransactionTable/NotificationTransactionsTable";
import { Button } from "@/app/components/Button";

export const Notifications = ({ profile, onNotificationAction, onTransactionClick }: NotificationsProperties) => {
	const { t } = useTranslation();
	const { persist } = useEnvironmentContext();

	const { transactions, markAllTransactionsAsRead, hasUnread } = useNotifications({ profile });

	useEffect(() => {
		markAllTransactionsAsRead(true);
		persist();
	}, []);

	return (
		<div className="w-[35rem]">
			<div className="flex items-center w-full justify-between dark:bg-black bg-theme-secondary-100 py-4 rounded-t-xl px-8">
				<div className="font-semibold text-lg text-theme-secondary-900 dark:text-theme-secondary-200">Notification</div>
				<Button variant="transparent" size="2xs" icon="CheckmarkDoubleCircle" disabled={!hasUnread} className="p-0 disabled:text-theme-secondary-500 dark:disabled:text-theme-secondary-800 text-theme-secondary-800 dark:text-theme-secondary-800" onClick={() => markAllTransactionsAsRead()}>
					<span>{t("COMMON.NOTIFICATIONS.MARK_ALL_AS_READ")}</span>

				</Button>
			</div>

			{transactions.length === 0 && (
				<div className="pt-4 pb-8 px-6">
					<EmptyBlock className="py-4">
						<span className="whitespace-nowrap">{t("COMMON.NOTIFICATIONS.EMPTY")}</span>
					</EmptyBlock>
					<Image name="EmptyNotifications" className="mx-auto mb-2 mt-8 w-64" />
				</div>
			)}

			{transactions.length > 0 && (
				<div className="max-h-[36rem] overflow-y-hidden overscroll-y-none w-full" data-testid="NotificationsWrapper">
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
