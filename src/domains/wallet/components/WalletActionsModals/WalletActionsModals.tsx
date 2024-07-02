import React, { useCallback, useMemo, VFC } from "react";

import { useActiveProfile, useWalletAlias } from "@/app/hooks";
import { TransactionExportModal } from "@/domains/transaction/components/TransactionExportModal";
import { UnlockTokensModal } from "@/domains/transaction/components/UnlockTokens";
import { DeleteWallet } from "@/domains/wallet/components/DeleteWallet";
import { ReceiveFunds } from "@/domains/wallet/components/ReceiveFunds";
import { UpdateWalletName } from "@/domains/wallet/components/UpdateWalletName";
import { WalletActionsProperties } from "@/domains/wallet/components/WalletActionsModals/WalletActionsModals.contracts";
import { WalletEncryptionWarning } from "@/domains/wallet/components/WalletEncryptionWarning";
import { useWalletActions } from "@/domains/wallet/hooks/use-wallet-actions";

export const WalletActionsModals: VFC<WalletActionsProperties> = ({
	wallet,
	activeModal,
	setActiveModal,
	onUpdateWallet,
}) => {
	const profile = useActiveProfile();
	const { getWalletAlias } = useWalletAlias();
	const { handleDelete, handleConfirmEncryptionWarning } = useWalletActions(wallet);

	const hideActiveModal = useCallback(
		(event?: React.MouseEvent<HTMLElement>) => {
			event?.preventDefault();
			event?.stopPropagation();
			setActiveModal(undefined);
		},
		[setActiveModal],
	);

	const { alias } = useMemo(
		() =>
			getWalletAlias({
				address: wallet.address(),
				network: wallet.network(),
				profile: profile,
			}),
		[profile, getWalletAlias, wallet],
	);

	return (
		<>
			{activeModal === "receive-funds" && (
				<ReceiveFunds
					address={wallet.address()}
					name={alias}
					network={wallet.network()}
					onClose={hideActiveModal}
				/>
			)}

			{activeModal === "wallet-name" && (
				<UpdateWalletName
					onAfterSave={() => {
						onUpdateWallet?.();
						hideActiveModal();
					}}
					onCancel={hideActiveModal}
					profile={profile}
					wallet={wallet}
				/>
			)}

			{activeModal === "delete-wallet" && (
				<DeleteWallet
					onClose={hideActiveModal}
					onCancel={hideActiveModal}
					onDelete={async () => {
						const hideModal = await handleDelete();
						if (hideModal) {
							hideActiveModal();
						}
					}}
					wallet={wallet}
				/>
			)}

			{activeModal === "second-signature" && (
				<WalletEncryptionWarning
					importType={wallet.actsWithMnemonicWithEncryption() ? "mnemonic" : "secret"}
					onCancel={hideActiveModal}
					onConfirm={handleConfirmEncryptionWarning}
				/>
			)}

			{activeModal === "unlockable-balances" && (
				<UnlockTokensModal profile={profile} wallet={wallet} onClose={hideActiveModal} />
			)}

			{activeModal === "transaction-history" && (
				<TransactionExportModal wallet={wallet} isOpen onClose={hideActiveModal} />
			)}
		</>
	);
};
