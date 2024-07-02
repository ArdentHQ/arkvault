import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { EmptyBlock } from "@/app/components/EmptyBlock";
import { Image } from "@/app/components/Image";
import { Table } from "@/app/components/Table";
import { useEnvironmentContext } from "@/app/contexts";
import { useBreakpoint } from "@/app/hooks";
import { NotificationTransactionsTable } from "@/domains/transaction/components/TransactionTable/NotificationTransactionsTable";

import { useNotifications } from "./hooks/use-notifications";
import { NotificationItem } from "./NotificationItem";
import { NotificationItemProperties, NotificationsProperties } from "./Notifications.contracts";
import { NotificationsWrapper } from "./styles";

export const Notifications = ({ profile, onNotificationAction, onTransactionClick }: NotificationsProperties) => {
	const { t } = useTranslation();
	const { persist } = useEnvironmentContext();
	const { isXs, isSm } = useBreakpoint();

	const { releases, transactions, markAllTransactionsAsRead } = useNotifications({ profile });
	const wrapperReference = useRef();

	useEffect(() => {
		markAllTransactionsAsRead(true);
		persist();
	}, []);

	if (transactions.length === 0 && releases.length === 0) {
		return (
			<NotificationsWrapper>
				<EmptyBlock>
					<span className="whitespace-nowrap">{t("COMMON.NOTIFICATIONS.EMPTY")}</span>
				</EmptyBlock>
				<Image name="EmptyNotifications" className="mx-auto mb-2 mt-8 w-64" />
			</NotificationsWrapper>
		);
	}

	return (
		<NotificationsWrapper
			wider={!(isXs || isSm)}
			ref={wrapperReference as React.MutableRefObject<any>}
			data-testid="NotificationsWrapper"
		>
			{releases.length > 0 && (
				<div className="space-y-2">
					<div className="text-base font-semibold text-theme-secondary-500">
						{t("COMMON.NOTIFICATIONS.PLUGINS_TITLE")}
					</div>
					<Table hideHeader columns={[{ Header: "-", className: "hidden" }]} data={releases}>
						{(notification: NotificationItemProperties) => (
							<NotificationItem
								{...notification}
								onAction={onNotificationAction}
								containmentRef={wrapperReference}
							/>
						)}
					</Table>
				</div>
			)}

			{transactions.length > 0 && (
				<NotificationTransactionsTable
					profile={profile}
					isLoading={profile.notifications().transactions().isSyncing() || transactions.length === 0}
					transactions={transactions}
					onClick={onTransactionClick}
				/>
			)}
		</NotificationsWrapper>
	);
};
