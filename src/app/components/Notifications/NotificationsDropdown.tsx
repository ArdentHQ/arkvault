import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React, { useState } from "react";

import { Button } from "@/app/components/Button";
import { Dot } from "@/app/components/Dot";
import { Dropdown } from "@/app/components/Dropdown";
import { Icon } from "@/app/components/Icon";
import { NavigationButtonWrapper } from "@/app/components/NavigationBar/NavigationBar.blocks";
import { Notifications, useNotifications } from "@/app/components/Notifications";
import { TransactionDetailModal } from "@/domains/transaction/components/TransactionDetailModal";

export const NotificationsDropdown = ({ profile }: { profile: Contracts.IProfile }) => {
	const [transactionModalItem, setTransactionModalItem] = useState<DTO.ExtendedConfirmedTransactionData | undefined>(
		undefined,
	);

	const { hasUnread } = useNotifications({ profile });

	return (
		<div>
			<Dropdown
				dropdownClass="mx-4 sm:mx-0 border-none pt-0 w-full md:w-auto"
				toggleContent={
					<NavigationButtonWrapper className="group">
						<Button variant="transparent" size="icon" data-testid="NavigationBar__buttons--notifications">
							<Icon name="Bell" size="lg" className="p-1" />
							{hasUnread && <Dot />}
						</Button>
					</NavigationButtonWrapper>
				}
			>
				<Notifications profile={profile} onTransactionClick={setTransactionModalItem} />
			</Dropdown>

			{transactionModalItem && (
				<TransactionDetailModal
					isOpen={!!transactionModalItem}
					transactionItem={transactionModalItem}
					profile={profile}
					onClose={() => setTransactionModalItem(undefined)}
				/>
			)}
		</div>
	);
};
