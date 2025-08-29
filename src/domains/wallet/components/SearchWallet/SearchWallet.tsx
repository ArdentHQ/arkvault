import { Contracts } from "@/app/lib/profiles";
import React, { FC, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { SearchWalletProperties } from "./SearchWallet.contracts";
import { EmptyResults } from "@/app/components/EmptyResults";
import { Modal } from "@/app/components/Modal";
import { useBreakpoint, useWalletAlias } from "@/app/hooks";
import { useSearchWallet } from "@/app/hooks/use-search-wallet";
import { HeaderSearchInput } from "@/app/components/Header/HeaderSearchInput";
import { ReceiverItem, ReceiverItemMobile } from "@/app/components/WalletListItem/WalletListItem.blocks";

export const SearchWallet: FC<SearchWalletProperties> = ({
	isOpen,
	title,
	description,
	disableAction,
	wallets,
	searchPlaceholder,
	size = "5xl",
	showNetwork = true,
	onClose,
	onSelectWallet,
	profile,
	selectedAddress,
}) => {
	const { setSearchKeyword, filteredList, isEmptyResults } = useSearchWallet({ profile, wallets });
	const filteredWallets = filteredList as Contracts.IReadWriteWallet[];

	const { t } = useTranslation();

	const { isXs } = useBreakpoint();

	const { getWalletAlias } = useWalletAlias();

	const getWalletAliasCallback = useCallback(
		(wallet: Contracts.IReadWriteWallet) => {
			const { alias } = getWalletAlias({
				address: wallet.address(),
				network: wallet.network(),
				profile,
			});

			return alias;
		},
		[getWalletAlias, profile],
	);

	const renderItems = useCallback(
		(wallet: Contracts.IReadWriteWallet, index: number) => {
			const alias = getWalletAliasCallback(wallet);
			const isSelected = selectedAddress === wallet.address();

			const handleOnClick = () => {
				onSelectWallet({
					address: wallet.address(),
					name: alias!,
					network: wallet.network(),
				});
			};

			if (isXs) {
				return (
					<ReceiverItemMobile
						key={index}
						wallet={wallet}
						selected={isSelected}
						onClick={handleOnClick}
						name={alias!}
						disabled={disableAction?.(wallet)}
					/>
				);
			}

			return (
				<ReceiverItem
					index={index}
					key={index}
					wallet={wallet}
					name={alias!}
					disabled={disableAction?.(wallet)}
					onClick={handleOnClick}
					exchangeCurrency={
						wallet.exchangeCurrency() ||
						(profile.settings().get(Contracts.ProfileSetting.ExchangeCurrency) as string)
					}
					selected={isSelected}
				/>
			);
		},
		[profile, disableAction, showNetwork, onSelectWallet, selectedAddress, isXs],
	);

	return createPortal(
		<Modal
			title={title}
			titleClass="text-theme-text"
			description={description}
			isOpen={isOpen}
			size={size}
			onClose={onClose}
			noButtons
		>
			<div className="mt-4">
				<HeaderSearchInput
					placeholder={searchPlaceholder}
					onSearch={setSearchKeyword}
					onReset={() => setSearchKeyword("")}
					debounceTimeout={100}
				/>

				<div className="mt-3 space-y-1">
					{filteredWallets.map((wallet, index) => renderItems(wallet, index))}
				</div>

				{isEmptyResults && (
					<EmptyResults
						className="mt-10"
						title={t("COMMON.EMPTY_RESULTS.TITLE")}
						subtitle={t("COMMON.EMPTY_RESULTS.SUBTITLE")}
					/>
				)}
			</div>
		</Modal>,
		document.body,
	);
};
