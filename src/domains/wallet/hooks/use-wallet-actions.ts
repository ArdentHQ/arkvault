/* eslint-disable sonarjs/cognitive-complexity */
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
import { usePortfolio } from "@/domains/portfolio/hooks/use-portfolio";

export const useWalletActions = (...wallets: Contracts.IReadWriteWallet[]) => {
	const { persist } = useEnvironmentContext();
	const profile = useActiveProfile();
	const history = useHistory();
	const { openExternal } = useLink();

	const { removeSelectedAddresses } = usePortfolio({ profile });

	const [activeModal, setActiveModal] = useState<WalletActionsModalType | undefined>(undefined);

	const wallet = wallets[0] as Contracts.IReadWriteWallet | undefined;

	const hasMultipleWallets = wallets.length > 1;

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

			if (hasMultipleWallets) {
				history.push(generatePath(ProfilePaths.SendTransfer, { profileId: profile.id() }));
				return;
			}

			history.push(
				generatePath(ProfilePaths.SendTransferWallet, { profileId: profile.id(), walletId: wallet.id() }),
			);
		},
		[stopEventBubbling, hasMultipleWallets, history, profile, wallet],
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

			for (const profileWallet of profile.wallets().values()) {
				if (profileWallet.address() === wallet.address()) {
					removeSelectedAddresses([wallet.address()], wallet.network());
					profile.wallets().forget(profileWallet.id());
					profile.notifications().transactions().forgetByRecipient(wallet.address());
				}
			}

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
				let url = generatePath(ProfilePaths.SignMessageWallet, {
					profileId: profile.id(),
					walletId: wallet.id(),
				});

				if (hasMultipleWallets) {
					url = generatePath(ProfilePaths.SignMessage, {
						profileId: profile.id(),
					});
				}

				history.push(url);
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
				let url = generatePath(ProfilePaths.SendDelegateRegistration, {
					profileId: profile.id(),
					walletId: wallet.id(),
				});

				if (hasMultipleWallets) {
					url = generatePath(ProfilePaths.SendRegistrationProfile, {
						profileId: profile.id(),
						registrationType: "validatorRegistration",
					});
				}

				history.push(url);
			}

			if (option.value === "delegate-resignation") {
				let url = generatePath(ProfilePaths.SendValidatorResignation, {
					profileId: profile.id(),
					walletId: wallet.id(),
				});

				if (hasMultipleWallets) {
					url = generatePath(ProfilePaths.SendValidatorResignationProfile, {
						profileId: profile.id(),
					});
				}

				history.push(url);
			}

			if (option.value === "username-registration") {
				let url = generatePath(ProfilePaths.SendUsernameRegistration, {
					profileId: profile.id(),
					walletId: wallet.id(),
				});

				if (hasMultipleWallets) {
					url = generatePath(ProfilePaths.SendRegistrationProfile, {
						profileId: profile.id(),
						registrationType: "usernameRegistration",
					});
				}

				history.push(url);
			}

			if (option.value === "username-resignation") {
				let url = generatePath(ProfilePaths.SendUsernameResignation, {
					profileId: profile.id(),
					walletId: wallet.id(),
				});

				if (hasMultipleWallets) {
					url = generatePath(ProfilePaths.SendUsernameResignationProfile, {
						profileId: profile.id(),
					});
				}

				history.push(url);
			}

			if (option.value === "open-explorer") {
				openExternal(wallet.explorerLink());
			}

			setActiveModal(option.value.toString() as WalletActionsModalType);
		},
		[wallet, history, profile, hasMultipleWallets, openExternal],
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
