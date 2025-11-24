import { Contracts, DTO } from "@/app/lib/profiles";
import React, { useState } from "react";

import { Button } from "@/app/components/Button";
import { Dot } from "@/app/components/Dot";
import { Icon } from "@/app/components/Icon";
import { useNotifications } from "@/app/components/Notifications";
import { TransactionDetailSidePanel } from "@/domains/transaction/components/TransactionDetailSidePanel";
import { Tooltip } from "@/app/components/Tooltip";
import { useTranslation } from "react-i18next";
import { Panel, usePanels } from "@/app/contexts";

export const NotificationsDropdown = ({ profile }: { profile: Contracts.IProfile }) => {
	const [transactionModalItem, setTransactionModalItem] = useState<DTO.ExtendedConfirmedTransactionData | undefined>(
		undefined,
	);

	const { hasUnread } = useNotifications({ profile });
	const { openPanel } = usePanels();

	const { t } = useTranslation();

	return (
		<div>
			<Tooltip content={t("COMMON.NOTIFICATIONS.TITLE")}>
				<Button
					onClick={() => {
						openPanel(Panel.Notifications);
					}}
					variant="transparent"
					size="icon"
					data-testid="NavigationBar__buttons--notifications"
					className="text-theme-secondary-700 dark:text-theme-dark-200 dark:hover:text-theme-dark-50 hover:text-theme-primary-700 dim:text-theme-dim-200 dim-hover:text-theme-dim-50"
				>
					<div className="relative">
						<Icon name="Bell" size="lg" className="m-0 p-1" />
						{hasUnread && <Dot />}
					</div>
				</Button>
			</Tooltip>

			{transactionModalItem && (
				<TransactionDetailSidePanel
					isOpen={!!transactionModalItem}
					transactionItem={transactionModalItem}
					profile={profile}
					onClose={() => setTransactionModalItem(undefined)}
				/>
			)}
		</div>
	);
};
