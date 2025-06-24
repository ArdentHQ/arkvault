/* eslint-disable sonarjs/cognitive-complexity */
import { Contracts } from "@/app/lib/profiles";
import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { generatePath } from "react-router";
import { DropdownOption } from "@/app/components/Dropdown";
import { useEnvironmentContext } from "@/app/contexts";
import { useActiveProfile } from "@/app/hooks";
import { WalletActionsModalType } from "@/domains/wallet/components/WalletActionsModals/WalletActionsModals.contracts";
import { ProfilePaths } from "@/router/paths";
import { useLink } from "@/app/hooks/use-link";

export const useWalletActions = ({
	handleSignMessage,
	wallets,
}: {
	handleSignMessage?: () => void;
	wallets: Contracts.IReadWriteWallet[];
}) => {
	const { persist } = useEnvironmentContext();
	const profile = useActiveProfile();
	const navigate = useNavigate();
	const { openExternal } = useLink();

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
		},
		[navigate, profile, wallet, stopEventBubbling],
	);

	const handleSend = useCallback(
		(event?: React.MouseEvent<HTMLElement>) => {
			if (!wallet) {
				return;
			}

			stopEventBubbling(event);

			if (hasMultipleWallets) {
				navigate(generatePath(ProfilePaths.SendTransfer, { profileId: profile.id() }));
				return;
			}

			navigate(generatePath(ProfilePaths.SendTransferWallet, { profileId: profile.id(), walletId: wallet.id() }));
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

			for (const profileWallet of profile.wallets().values()) {
				if (profileWallet.address() === wallet.address()) {
					profile.wallets().forget(profileWallet.id());
					profile.notifications().transactions().forgetByRecipient(wallet.address());
				}
			}

			await persist();

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
				handleSignMessage?.();
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

			if (option.value === "validator-registration") {
				let url = generatePath(ProfilePaths.SendValidatorRegistration, {
					profileId: profile.id(),
					walletId: wallet.id(),
				});

				if (hasMultipleWallets) {
					url = generatePath(ProfilePaths.SendRegistrationProfile, {
						profileId: profile.id(),
						registrationType: "validatorRegistration",
					});
				}

				navigate(url);
			}

			if (option.value === "validator-resignation") {
				let url = generatePath(ProfilePaths.SendValidatorResignation, {
					profileId: profile.id(),
					walletId: wallet.id(),
				});

				if (hasMultipleWallets) {
					url = generatePath(ProfilePaths.SendValidatorResignationProfile, {
						profileId: profile.id(),
					});
				}

				navigate(url);
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

				navigate(url);
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

				navigate(url);
			}

			if (option.value === "open-explorer") {
				openExternal(wallet.explorerLink());
			}

			setActiveModal(option.value.toString() as WalletActionsModalType);
		},
		[wallet, history, profile, hasMultipleWallets, openExternal],
	);

	return {
		activeModal,
		handleDelete,
		handleOpen,
		handleSelectOption,
		handleSend,
		handleToggleStar,
		setActiveModal,
	};
};
