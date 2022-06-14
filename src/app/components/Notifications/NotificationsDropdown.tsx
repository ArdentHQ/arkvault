import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React, { useState } from "react";

import { Button } from "@/app/components/Button";
import { Dropdown } from "@/app/components/Dropdown";
import { Icon } from "@/app/components/Icon";
import { NavigationButtonWrapper } from "@/app/components/NavigationBar/NavigationBar.blocks";
import { Notifications, useNotifications } from "@/app/components/Notifications";
import { TransactionDetailModal } from "@/domains/transaction/components/TransactionDetailModal";
import { useBreakpoint } from "@/app/hooks";

export const NotificationsDropdown = ({ profile }: { profile: Contracts.IProfile }) => {
	const [transactionModalItem, setTransactionModalItem] = useState<DTO.ExtendedConfirmedTransactionData | undefined>(
		undefined,
	);

	const { hasUnread } = useNotifications({ profile });
	const { isSm, isMd } = useBreakpoint();

	return (
		<div>
			<Dropdown
				position={isSm || isMd ? "top-center" : "right"}
				dropdownClass="mt-8 mx-4 sm:mx-0 border-none"
				toggleContent={
					<NavigationButtonWrapper className="group">
						<Button variant="transparent" size="icon" data-testid="NavigationBar__buttons--notifications">
							<Icon name="Bell" size="lg" className="p-1" />
							{hasUnread && (
								<div className="absolute top-1 right-1 flex items-center justify-center rounded-full bg-theme-background p-1 transition-all duration-100 ease-linear group-hover:bg-theme-primary-100 dark:group-hover:bg-theme-secondary-800">
									<div className="h-2 w-2 rounded-full bg-theme-danger-500" />
								</div>
							)}
						</Button>
					</NavigationButtonWrapper>
				}
			>
				<div className="mt-2">
					<Notifications profile={profile} onTransactionClick={setTransactionModalItem} />
				</div>
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
