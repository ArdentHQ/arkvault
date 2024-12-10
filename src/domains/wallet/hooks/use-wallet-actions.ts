import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useCallback, useState } from "react";
import { useHistory } from "react-router-dom";
import { generatePath } from "react-router";
import { DropdownOption } from "@/app/components/Dropdown";
import { useEnvironmentContext } from "@/app/contexts";
import { useActiveProfile } from "@/app/hooks";
import { WalletActionsModalType } from "@/domains/wallet/components/WalletActionsModals/WalletActionsModals.contracts";
import { ProfilePaths } from "@/router/paths";
import { useLink } from "@/app/hooks/use-link";

export const useWalletActions = (wallet?: Contracts.IReadWriteWallet) => {
	const { persist } = useEnvironmentContext();
	const profile = useActiveProfile();
	const history = useHistory();
	const { openExternal } = useLink();

	const [activeModal, setActiveModal] = useState<WalletActionsModalType | undefined>(undefined);

	const stopEventBubbling = useCallback((event?: React.MouseEvent<HTMLElement>) => {
		event?.preventDefault();
		event?.stopPropagation();
	}, []);

	const handleOpen = useCallback(
		(event?: React.MouseEvent<HTMLElement>) => {
			if (!wallet) {
				return;
			}
			stopEventBubbling(event);
			history.push(generatePath(ProfilePaths.WalletDetails, { profileId: profile.id(), walletId: wallet.id() }));
		},
		[history, profile, wallet, stopEventBubbling],
	);

	const handleSend = useCallback(
		(event?: React.MouseEvent<HTMLElement>) => {
			if (!wallet) {
				return;
			}
			stopEventBubbling(event);
			history.push(
				generatePath(ProfilePaths.SendTransferWallet, { profileId: profile.id(), walletId: wallet.id() }),
			);
		},
		[history, profile, wallet, stopEventBubbling],
	);

	const handleToggleStar = useCallback(
		async (event?: React.MouseEvent<HTMLElement>) => {
			if (!wallet) {
				return;
			}
			stopEventBubbling(event);
			wallet.toggleStarred();
			await persist();
		},
		[wallet, persist, stopEventBubbling],
	);

	const handleDelete = useCallback(
		async (event?: React.MouseEvent<HTMLElement>) => {
			if (!wallet) {
				return;
			}

			stopEventBubbling(event);

			const profileId = profile.id();
			const walletId = wallet.id();

			profile.wallets().forget(walletId);
			profile.notifications().transactions().forgetByRecipient(wallet.address());
			await persist();

			if (history.location.pathname === generatePath(ProfilePaths.WalletDetails, { profileId, walletId })) {
				history.push(generatePath(ProfilePaths.Dashboard, { profileId }));
				return;
			}

			return true;
		},
		[profile, history, wallet, persist, stopEventBubbling],
	);

	const handleSelectOption = useCallback(
		(option: DropdownOption) => {
			if (!wallet) {
				return;
			}

			if (option.value === "sign-message") {
				history.push(
					generatePath(ProfilePaths.SignMessageWallet, { profileId: profile.id(), walletId: wallet.id() }),
				);
			}

			if (option.value === "verify-message") {
				history.push(
					generatePath(ProfilePaths.VerifyMessageWallet, { profileId: profile.id(), walletId: wallet.id() }),
				);
			}

			if (option.value === "multi-signature") {
				history.push(
					generatePath(ProfilePaths.SendMultiSignature, { profileId: profile.id(), walletId: wallet.id() }),
				);
			}

			if (option.value === "delegate-registration") {
				history.push(
					generatePath(ProfilePaths.SendDelegateRegistration, {
						profileId: profile.id(),
						walletId: wallet.id(),
					}),
				);
			}

			if (option.value === "delegate-resignation") {
				history.push(
					generatePath(ProfilePaths.SendValidatorResignation, {
						profileId: profile.id(),
						walletId: wallet.id(),
					}),
				);
			}

			if (option.value === "open-explorer") {
				openExternal(wallet.explorerLink());
			}

			setActiveModal(option.value.toString() as WalletActionsModalType);
		},
		[wallet, history, profile, openExternal],
	);

	const handleCreate = useCallback(
		(event?: React.MouseEvent<HTMLElement>) => {
			stopEventBubbling(event);
			history.push(generatePath(ProfilePaths.CreateWallet, { profileId: profile.id() }));
		},
		[history, profile, stopEventBubbling],
	);

	const handleImport = useCallback(
		(event?: React.MouseEvent<HTMLElement>) => {
			stopEventBubbling(event);
			history.push(generatePath(ProfilePaths.ImportWallet, { profileId: profile.id() }));
		},
		[history, profile, stopEventBubbling],
	);

	const handleImportLedger = useCallback(
		(event?: React.MouseEvent<HTMLElement>) => {
			stopEventBubbling(event);
			history.push(generatePath(ProfilePaths.ImportWalletLedger, { profileId: profile.id() }));
		},
		[history, profile, stopEventBubbling],
	);

	return {
		activeModal,
		handleCreate,
		handleDelete,
		handleImport,
		handleImportLedger,
		handleOpen,
		handleSelectOption,
		handleSend,
		handleToggleStar,
		setActiveModal,
	};
};
