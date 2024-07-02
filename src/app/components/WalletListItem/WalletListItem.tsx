import React from "react";

import { TableRow } from "@/app/components/Table";
import {
	Balance,
	ButtonsCell,
	Currency,
	Info,
	Starred,
	WalletCell,
	WalletItemAvatar,
	WalletItemBalance,
	WalletItemDetails,
	WalletItemExtraDetails,
	WalletListItemMobile,
} from "@/app/components/WalletListItem/WalletListItem.blocks";
import { WalletListItemProperties } from "@/app/components/WalletListItem/WalletListItem.contracts";
import { WalletActionsModals } from "@/domains/wallet/components/WalletActionsModals/WalletActionsModals";
import { useWalletActions } from "@/domains/wallet/hooks/use-wallet-actions";
import { isFullySynced } from "@/domains/wallet/utils/is-fully-synced";

export const WalletListItem: React.VFC<WalletListItemProperties> = ({ wallet, isCompact, isLargeScreen = true }) => {
	const isSynced = isFullySynced(wallet);

	const { handleToggleStar, handleOpen, handleSelectOption, handleSend, activeModal, setActiveModal } =
		useWalletActions(wallet);

	const isRestoring = !wallet.hasBeenFullyRestored();
	const isButtonDisabled = wallet.balance() === 0 || isRestoring || !wallet.hasSyncedWithNetwork();

	if (isLargeScreen) {
		return (
			<>
				<TableRow onClick={isSynced ? handleOpen : undefined}>
					<Starred onToggleStar={handleToggleStar} isCompact={isCompact} wallet={wallet} />
					<WalletCell isCompact={isCompact} wallet={wallet} />
					<Info isCompact={isCompact} wallet={wallet} />
					<Balance wallet={wallet} isCompact={isCompact} isSynced={isSynced} />
					<Currency wallet={wallet} isCompact={isCompact} isSynced={isSynced} />
					<ButtonsCell
						wallet={wallet}
						isCompact={isCompact}
						onSelectOption={handleSelectOption}
						onSend={handleSend}
					/>
				</TableRow>
				{activeModal && (
					<tr>
						<td>
							<WalletActionsModals
								wallet={wallet}
								activeModal={activeModal}
								setActiveModal={setActiveModal}
							/>
						</td>
					</tr>
				)}
			</>
		);
	}

	return (
		<WalletListItemMobile
			isButtonDisabled={isButtonDisabled}
			onClick={isSynced ? handleOpen : undefined}
			onButtonClick={handleSend}
			avatar={<WalletItemAvatar wallet={wallet} />}
			details={<WalletItemDetails wallet={wallet} />}
			extraDetails={<WalletItemExtraDetails wallet={wallet} isCompact={isCompact} />}
			balance={<WalletItemBalance wallet={wallet} isCompact={isCompact} isSynced={isSynced} />}
		/>
	);
};
