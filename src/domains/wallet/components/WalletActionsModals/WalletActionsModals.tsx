import React, { useCallback, useMemo } from "react";
import { useActiveProfile, useWalletAlias } from "@/app/hooks";
import { DeleteWallet } from "@/domains/wallet/components/DeleteWallet";
import { ReceiveFunds } from "@/domains/wallet/components/ReceiveFunds";
import { UpdateWalletName } from "@/domains/wallet/components/UpdateWalletName";
import { UpdateAccountNameModal } from "@/domains/wallet/components/UpdateAccountName";
import { WalletActionsProperties } from "@/domains/wallet/components/WalletActionsModals/WalletActionsModals.contracts";
import { useWalletActions } from "@/domains/wallet/hooks/use-wallet-actions";
import { TransactionExportModal } from "@/domains/transaction/components/TransactionExportModal";
import { Contracts } from "@/app/lib/profiles";

export const WalletActionsModals = ({
	wallets,
	activeModal,
	setActiveModal,
	onUpdateWallet,
}: WalletActionsProperties) => {
	const profile = useActiveProfile();
	const { getWalletAlias } = useWalletAlias();
	const { handleDelete } = useWalletActions({ wallets });

	const hideActiveModal = useCallback(
		(event?: React.MouseEvent<HTMLElement>) => {
			event?.preventDefault();
			event?.stopPropagation();
			setActiveModal(undefined);
		},
		[setActiveModal],
	);

	const wallet = wallets.at(0) as Contracts.IReadWriteWallet;

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

			{activeModal === "hd-account-name" && (
				<UpdateAccountNameModal
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

			{activeModal === "transaction-history" && (
				<TransactionExportModal wallets={wallets} isOpen onClose={hideActiveModal} />
			)}
		</>
	);
};
