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
import {TableCell, TableRow} from "@/app/components/Table";
import { isFullySynced } from "@/domains/wallet/utils/is-fully-synced";
import {Address} from "@/app/components/Address";
import {useActiveProfile, useWalletAlias} from "@/app/hooks";

export const WalletListItem: React.VFC<WalletListItemProperties> = ({ wallet, isLargeScreen = true }) => {
	const isSynced = isFullySynced(wallet);

	const { handleToggleStar, handleOpen, handleSelectOption, handleSend, activeModal, setActiveModal } =
		useWalletActions(wallet);

	const isRestoring = !wallet.hasBeenFullyRestored();
	const isButtonDisabled = wallet.balance() === 0 || isRestoring || !wallet.hasSyncedWithNetwork();

	const profile = useActiveProfile();
	const { getWalletAlias } = useWalletAlias();

	const { alias } = getWalletAlias({
		address: wallet.address(),
		network: wallet.network(),
		profile: profile,
	});

	if (isLargeScreen) {
		return (
			<>
				<TableRow onClick={isSynced ? handleOpen : undefined} className="relative">
					<Starred onToggleStar={handleToggleStar} wallet={wallet} />
					<TableCell size="sm" innerClassName="-ml-3 space-x-3" className="hidden lg:table-cell" data-testid="TableCell_Wallet">
						<div className="w-24 flex-1 overflow-hidden">
							<Address
								walletName={alias}
								walletNameClass="text-sm leading-[17px]"
							/>
						</div>
					</TableCell>
					<WalletCell wallet={wallet} />
					<Info wallet={wallet} />
					<Balance wallet={wallet} isSynced={isSynced} />
					<Currency wallet={wallet} isSynced={isSynced} />
					<ButtonsCell wallet={wallet} onSelectOption={handleSelectOption} onSend={handleSend} />
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
			details={							<Address
				walletName={alias}
				walletNameClass="text-sm text-theme-text leading-[17px]"
				address={wallet.address()}
				showCopyButton
				addressClass="text-sm leading-[17px] text-theme-secondary-700 dark:text-theme-secondary-700"
			/>}
			extraDetails={<WalletItemExtraDetails wallet={wallet} />}
			balance={<WalletItemBalance wallet={wallet} isSynced={isSynced} />}
		/>
	);
};
