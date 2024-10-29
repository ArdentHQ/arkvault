import { Contracts } from "@ardenthq/sdk-profiles";
import cn from "classnames";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Address } from "@/app/components/Address";
import { Avatar } from "@/app/components/Avatar";
import { Circle } from "@/app/components/Circle";
import { useFormField } from "@/app/components/Form/useFormField";
import { Icon } from "@/app/components/Icon";
import { Input } from "@/app/components/Input";
import { useWalletAlias } from "@/app/hooks";
import { SearchWallet } from "@/domains/wallet/components/SearchWallet";
import { SelectedWallet } from "@/domains/wallet/components/SearchWallet/SearchWallet.contracts";

type SelectAddressProperties = {
	wallet?: SelectedWallet;
	wallets: Contracts.IReadWriteWallet[];
	profile: Contracts.IProfile;
	showUserIcon?: boolean;
	disabled?: boolean;
	isInvalid?: boolean;
	title?: string;
	description?: string;
	showWalletName?: boolean;
	showWalletAvatar?: boolean;
	disableAction?: (wallet: Contracts.IReadWriteWallet) => boolean;
	inputClassName?: string;
	onChange?: (address: string) => void;
} & Omit<React.InputHTMLAttributes<any>, "onChange">;

const WalletAvatar = ({ address }: any) => {
	if (!address) {
		return (
			<Circle
				className="border-theme-secondary-200 bg-theme-secondary-200 dark:border-theme-secondary-700 dark:bg-theme-secondary-700"
				size="sm"
				noShadow
			/>
		);
	}
	return <Avatar address={address} size="sm" noShadow />;
};

export const SelectAddress = React.forwardRef<HTMLInputElement, SelectAddressProperties>(
	(
		{
			wallet,
			wallets,
			profile,
			disabled,
			isInvalid,
			showWalletAvatar = true,
			showUserIcon = true,
			showWalletName = true,
			inputClassName,
			onChange,
			title,
			description,
			disableAction = (wallet: Contracts.IReadWriteWallet) => !wallet.balance(),
		}: SelectAddressProperties,
		reference,
	) => {
		const [searchWalletIsOpen, setSearchWalletIsOpen] = useState(false);
		const [selectedWallet, setSelectedWallet] = useState(wallet);

		useEffect(() => setSelectedWallet(wallet), [wallet]);

		const fieldContext = useFormField();
		const isInvalidField = fieldContext?.isInvalid || isInvalid;

		const { t } = useTranslation();

		const handleSelectWallet = useCallback(
			(wallet: SelectedWallet) => {
				setSelectedWallet(wallet);
				setSearchWalletIsOpen(false);
				onChange?.(wallet.address);
			},
			[setSelectedWallet, setSearchWalletIsOpen, onChange],
		);

		const { getWalletAlias } = useWalletAlias();

		const alias = useMemo(() => {
			if (!selectedWallet) {
				return;
			}

			return getWalletAlias({
				...selectedWallet,
				profile,
			}).alias;
		}, [getWalletAlias, profile, selectedWallet]);

		const inputAddons = () => {
			const addons = {} as Record<string, any>;

			if (showUserIcon) {
				addons.end = {
					content: (
						<div className="flex items-center space-x-3 text-theme-primary-300 dark:text-theme-secondary-600">
							<Icon name="User" size="lg" />
						</div>
					),
				};
			}

			if (showWalletAvatar) {
				addons.start = {
					content: <WalletAvatar address={selectedWallet?.address} />,
				};
			}

			return addons;
		};

		return (
			<>
				<button
					data-testid="SelectAddress__wrapper"
					className={cn(
						"relative w-full rounded focus:outline-none focus:ring-2 focus:ring-theme-primary-400",
						{ "cursor-default": disabled },
					)}
					type="button"
					onClick={() => setSearchWalletIsOpen(true)}
					disabled={disabled}
				>
					<span
						className={cn(
							"absolute inset-y-0 left-14 flex items-center border border-transparent",
							showUserIcon ? "right-13" : "right-4",
							showWalletAvatar ? "left-14" : "left-4",
							{
								"right-13": !showUserIcon && isInvalidField,
								"right-24": showUserIcon && isInvalidField,
							},
						)}
					>
						<Address
							address={selectedWallet?.address}
							walletName={showWalletName ? alias : undefined}
							addressClass="text-sm sm:text-base text-theme-secondary-500 dark:text-theme-secondary-700"
							walletNameClass="text-sm sm:text-base"
						/>
					</span>

					<Input
						className={inputClassName}
						data-testid="SelectAddress__input"
						ref={reference}
						value={selectedWallet?.address || ""}
						hideInputValue={true}
						readOnly
						disabled={disabled}
						isInvalid={isInvalidField}
						addons={inputAddons()}
					/>
				</button>

				<SearchWallet
					isOpen={searchWalletIsOpen}
					profile={profile}
					title={title || t("PROFILE.MODAL_SELECT_SENDER.TITLE")}
					description={description || t("PROFILE.MODAL_SELECT_SENDER.DESCRIPTION")}
					disableAction={disableAction}
					searchPlaceholder={t("PROFILE.MODAL_SELECT_SENDER.SEARCH_PLACEHOLDER")}
					wallets={wallets}
					size="4xl"
					showConvertedValue={false}
					showNetwork={false}
					onSelectWallet={handleSelectWallet}
					onClose={() => setSearchWalletIsOpen(false)}
					selectedAddress={selectedWallet?.address}
				/>
			</>
		);
	},
);

SelectAddress.displayName = "SelectAddress";
