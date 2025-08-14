import React, { FC, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { RecipientProperties, SearchRecipientProperties } from "./SearchRecipient.contracts";
import { EmptyResults } from "@/app/components/EmptyResults";
import { Modal } from "@/app/components/Modal";
import { useSearchWallet } from "@/app/hooks/use-search-wallet";
import { useBreakpoint } from "@/app/hooks";
import { HeaderSearchInput } from "@/app/components/Header/HeaderSearchInput";
import { RecipientItem, RecipientItemMobile } from "@/app/components/WalletListItem/WalletListItem.blocks";

export const SearchRecipient: FC<SearchRecipientProperties> = ({
	title,
	description,
	isOpen,
	onClose,
	onAction,
	recipients,
	selectedAddress,
	profile,
}) => {
	const { setSearchKeyword, filteredList, isEmptyResults } = useSearchWallet({
		profile,
		wallets: recipients,
	});

	const filteredRecipients = filteredList as RecipientProperties[];

	const { t } = useTranslation();

	const { isXs } = useBreakpoint();

	const renderItems = useCallback(
		(recipient: RecipientProperties, index: number) => {
			if (isXs) {
				return (
					<RecipientItemMobile
						key={index}
						address={recipient.address}
						type={recipient.type === "wallet" ? t("COMMON.MY_ADDRESS") : t("COMMON.CONTACT")}
						name={recipient.alias!}
						selected={recipient.address === selectedAddress}
						onClick={() => onAction(recipient.address)}
					/>
				);
			}

			return (
				<RecipientItem
					index={index}
					key={index}
					address={recipient.address}
					type={recipient.type === "wallet" ? t("COMMON.MY_ADDRESS") : t("COMMON.CONTACT")}
					name={recipient.alias!}
					selected={recipient.address === selectedAddress}
					onClick={() => onAction(recipient.address)}
				/>
			);
		},
		[selectedAddress, onAction, isXs],
	);

	return (
		<Modal
			isOpen={isOpen}
			title={title || t("TRANSACTION.MODAL_SEARCH_RECIPIENT.TITLE")}
			description={description || t("TRANSACTION.MODAL_SEARCH_RECIPIENT.DESCRIPTION")}
			size="3xl"
			onClose={onClose}
			noButtons
		>
			<div className="mt-4">
				<HeaderSearchInput
					placeholder={t("TRANSACTION.MODAL_SEARCH_RECIPIENT.SEARCH_PLACEHOLDER")}
					onSearch={setSearchKeyword}
					onReset={() => setSearchKeyword("")}
					debounceTimeout={100}
				/>

				<div className="mt-3 space-y-1">
					{filteredRecipients.map((recipient, index) => renderItems(recipient, index))}
				</div>

				{isEmptyResults && (
					<EmptyResults
						className="mt-10 rounded-xl"
						title={t("COMMON.EMPTY_RESULTS.TITLE")}
						subtitle={t("COMMON.EMPTY_RESULTS.SUBTITLE")}
					/>
				)}
			</div>
		</Modal>
	);
};
