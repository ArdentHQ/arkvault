import React from "react";
import {
	Balance,
	ButtonsCell,
	Currency,
	Info,
	WalletCell,
	Starred,
	WalletListItemMobile,
	WalletItemAvatar,
	WalletItemDetails,
	WalletItemExtraDetails,
	WalletItemBalance,
} from "@/app/components/WalletListItem/WalletListItem.blocks";
import { WalletListItemProperties } from "@/app/components/WalletListItem/WalletListItem.contracts";
import { WalletActionsModals } from "@/domains/wallet/components/WalletActionsModals/WalletActionsModals";
import { useWalletActions } from "@/domains/wallet/hooks/use-wallet-actions";
import { TableRow } from "@/app/components/Table";
import { isFullySynced } from "@/domains/wallet/utils/is-fully-synced";

export const WalletListItem: React.VFC<WalletListItemProperties> = ({ wallet, isLargeScreen = true }) => {
	const isSynced = isFullySynced(wallet);

	const { handleToggleStar, handleOpen, handleSelectOption, handleSend, activeModal, setActiveModal } =
		useWalletActions(wallet);

	const isRestoring = !wallet.hasBeenFullyRestored();
	const isButtonDisabled = wallet.balance() === 0 || isRestoring || !wallet.hasSyncedWithNetwork();

	if (isLargeScreen) {
		return (
			<>
				<TableRow onClick={isSynced ? handleOpen : undefined}>
					<Starred onToggleStar={handleToggleStar} wallet={wallet} />
					<WalletCell wallet={wallet} />
					<Info wallet={wallet} />
					<Balance wallet={wallet} isSynced={isSynced} />
					<Currency wallet={wallet} isSynced={isSynced} />
					<ButtonsCell
						wallet={wallet}
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
			extraDetails={<WalletItemExtraDetails wallet={wallet} />}
			balance={<WalletItemBalance wallet={wallet} isSynced={isSynced} />}
		/>
	);
};
