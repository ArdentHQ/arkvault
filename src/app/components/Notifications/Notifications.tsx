import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useNotifications } from "./hooks/use-notifications";
import { NotificationsProperties } from "./Notifications.contracts";
import { EmptyBlock } from "@/app/components/EmptyBlock";
import { Image } from "@/app/components/Image";
import { useEnvironmentContext } from "@/app/contexts";
import { NotificationTransactionsTable } from "@/domains/transaction/components/TransactionTable/NotificationTransactionsTable";

export const Notifications = ({ profile, onTransactionClick, hideDropdown }: NotificationsProperties) => {
	const { t } = useTranslation();
	const { persist } = useEnvironmentContext();

	const { transactions, markAllTransactionsAsRead } = useNotifications({ profile });

	useEffect(() => {
		markAllTransactionsAsRead(true);
		persist();
	}, []);

	return (
		<div className="w-full sm:w-[35rem] dark:bg-theme-dark-900" data-testid="NotificationsWrapper">
			<div className="flex justify-between items-center py-4 px-6 rounded-t-xl dark:bg-black bg-theme-secondary-100">
				<div className="text-sm font-semibold text-theme-secondary-700 leading-[17px] dark:text-theme-dark-200">
					Notification
				</div>
			</div>

			{transactions.length === 0 && (
				<div className="px-6 pt-4 pb-8">
					<EmptyBlock className="py-4">
						<span>{t("COMMON.NOTIFICATIONS.EMPTY")}</span>
					</EmptyBlock>
					<div className="mt-8 mb-2 w-full">
						<Image name="EmptyNotifications" className="mx-auto w-full sm:w-64" />
					</div>
				</div>
			)}

			{transactions.length > 0 && (
				<div
					className="overflow-y-hidden overscroll-y-none w-full max-h-[36rem]"
					data-testid="NotificationsWrapper"
				>
					{transactions.length > 0 && (
						<NotificationTransactionsTable
							profile={profile}
							isLoading={
								/* profile.notifications().transactions().isSyncing() || */ transactions.length === 0
							}
							transactions={transactions}
							onClick={(item) => {
								onTransactionClick?.(item);
								hideDropdown?.();
							}}
						/>
					)}
				</div>
			)}
		</div>
	);
};
