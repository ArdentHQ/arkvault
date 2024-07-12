import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

	const navigate = useNavigate();
	const location = useLocation();

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
			navigate(generatePath(ProfilePaths.WalletDetails, { profileId: profile.id(), walletId: wallet.id() }));
		},
		[navigate, profile, wallet, stopEventBubbling],
	);

	const handleSend = useCallback(
		(event?: React.MouseEvent<HTMLElement>) => {
			if (!wallet) {
				return;
			}
			stopEventBubbling(event);
			navigate(generatePath(ProfilePaths.SendTransferWallet, { profileId: profile.id(), walletId: wallet.id() }));
		},
		[navigate, profile, wallet, stopEventBubbling],
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

			if (location.pathname === generatePath(ProfilePaths.WalletDetails, { profileId, walletId })) {
				navigate(generatePath(ProfilePaths.Dashboard, { profileId }));
				return;
			}

			return true;
		},
		[profile, navigate, location, wallet, persist, stopEventBubbling],
	);

	const handleSelectOption = useCallback(
		(option: DropdownOption) => {
			if (!wallet) {
				return;
			}

			if (option.value === "sign-message") {
				navigate(
					generatePath(ProfilePaths.SignMessageWallet, { profileId: profile.id(), walletId: wallet.id() }),
				);
			}

			if (option.value === "verify-message") {
				navigate(
					generatePath(ProfilePaths.VerifyMessageWallet, { profileId: profile.id(), walletId: wallet.id() }),
				);
			}

			if (option.value === "multi-signature") {
				navigate(
					generatePath(ProfilePaths.SendMultiSignature, { profileId: profile.id(), walletId: wallet.id() }),
				);
			}

			if (option.value === "second-signature" && !wallet.usesPassword()) {
				navigate(
					generatePath(ProfilePaths.SendSecondSignature, { profileId: profile.id(), walletId: wallet.id() }),
				);
			}

			if (option.value === "delegate-registration") {
				navigate(
					generatePath(ProfilePaths.SendDelegateRegistration, {
						profileId: profile.id(),
						walletId: wallet.id(),
					}),
				);
			}

			if (option.value === "delegate-resignation") {
				navigate(
					generatePath(ProfilePaths.SendDelegateResignation, {
						profileId: profile.id(),
						walletId: wallet.id(),
					}),
				);
			}

			if (option.value === "store-hash") {
				navigate(generatePath(ProfilePaths.SendIpfs, { profileId: profile.id(), walletId: wallet.id() }));
			}

			if (option.value === "open-explorer") {
				openExternal(wallet.explorerLink());
			}

			setActiveModal(option.value.toString() as WalletActionsModalType);
		},
		[wallet, navigate, profile, openExternal],
	);

	const handleCreate = useCallback(
		(event?: React.MouseEvent<HTMLElement>) => {
			stopEventBubbling(event);
			navigate(generatePath(ProfilePaths.CreateWallet, { profileId: profile.id() }));
		},
		[navigate, profile, stopEventBubbling],
	);

	const handleImport = useCallback(
		(event?: React.MouseEvent<HTMLElement>) => {
			stopEventBubbling(event);
			navigate(generatePath(ProfilePaths.ImportWallet, { profileId: profile.id() }));
		},
		[navigate, profile, stopEventBubbling],
	);

	const handleImportLedger = useCallback(
		(event?: React.MouseEvent<HTMLElement>) => {
			stopEventBubbling(event);
			navigate(generatePath(ProfilePaths.ImportWalletLedger, { profileId: profile.id() }));
		},
		[navigate, profile, stopEventBubbling],
	);

	const handleConfirmEncryptionWarning = useCallback(
		(event?: React.MouseEvent<HTMLElement>) => {
			if (!wallet) {
				return;
			}
			stopEventBubbling(event);
			navigate(
				generatePath(ProfilePaths.SendSecondSignature, { profileId: profile.id(), walletId: wallet.id() }),
			);
		},
		[navigate, profile, wallet, stopEventBubbling],
	);

	return {
		activeModal,
		handleConfirmEncryptionWarning,
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
