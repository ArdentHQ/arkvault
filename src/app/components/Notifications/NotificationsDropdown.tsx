import { Contracts, DTO } from "@/app/lib/profiles";
import React, { useState } from "react";

import { Button } from "@/app/components/Button";
import { Dot } from "@/app/components/Dot";
import { Dropdown } from "@/app/components/Dropdown";
import { Icon } from "@/app/components/Icon";
import { NavigationButtonWrapper } from "@/app/components/NavigationBar/NavigationBar.blocks";
import { Notifications, useNotifications } from "@/app/components/Notifications";
import { TransactionDetailSidePanel } from "@/domains/transaction/components/TransactionDetailSidePanel";
import { Tooltip } from "@/app/components/Tooltip";
import { useTranslation } from "react-i18next";
export const NotificationsDropdown = ({ profile }: { profile: Contracts.IProfile }) => {
	const [transactionModalItem, setTransactionModalItem] = useState<DTO.ExtendedConfirmedTransactionData | undefined>(
		undefined,
	);

	const { hasUnread } = useNotifications({ profile });

	const { t } = useTranslation();

	return (
		<div>
			<Dropdown
				wrapperClass="mt-2 dim:bg-theme-dim-950"
				toggleContent={
					<NavigationButtonWrapper className="group">
						<Tooltip content={t("COMMON.NOTIFICATIONS.TITLE")}>
							<Button
								variant="transparent"
								size="icon"
								data-testid="NavigationBar__buttons--notifications"
								className="text-theme-secondary-700 dark:text-theme-dark-200 dark:hover:text-theme-dark-50 hover:text-theme-primary-700 dim:text-theme-dim-200 dim-hover:text-theme-dim-50"
							>
								<Icon name="Bell" size="lg" className="m-0 p-1" />
								{hasUnread && <Dot />}
							</Button>
						</Tooltip>
					</NavigationButtonWrapper>
				}
			>
				<Notifications profile={profile} onTransactionClick={setTransactionModalItem} />
			</Dropdown>

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
