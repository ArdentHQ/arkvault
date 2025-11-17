import { Networks } from "@/app/lib/mainsail";
import { Contracts } from "@/app/lib/profiles";
import cn from "classnames";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Address } from "@/app/components/Address";
import { useFormField } from "@/app/components/Form/useFormField";
import { Select } from "@/app/components/SelectDropdown";
import { TruncateEnd } from "@/app/components/TruncateEnd";
import { useWalletAlias } from "@/app/hooks/use-wallet-alias";
import { Icon } from "@/app/components/Icon";
import { Amount } from "@/app/components/Amount";
import { NetworkOption } from "@/app/components/NavigationBar/components/SelectNetwork/SelectNetwork.blocks";
import { Tooltip } from "@/app/components/Tooltip";
import { SearchWallet } from "@/domains/wallet/components/SearchWallet";
import { SelectedWallet } from "@/domains/wallet/components/SearchWallet/SearchWallet.contracts";

type SelectAddressDropdownProperties = {
	wallet?: Contracts.IReadWriteWallet;
	wallets: Contracts.IReadWriteWallet[];
	defaultNetwork?: Networks.Network;
	profile: Contracts.IProfile;
	disabled?: boolean;
	isInvalid?: boolean;
	placeholder?: string;
	onChange?: (wallet?: Contracts.IReadWriteWallet) => void;
	disableAction?: (wallet: Contracts.IReadWriteWallet) => boolean;
	showBalance?: boolean;
	showOptions?: boolean;
} & Omit<React.InputHTMLAttributes<any>, "onChange">;

export const OptionLabel = ({
	option,
	network,
	profile,
	showBalance = false,
}: {
	option: any;
	network?: Networks.Network;
	profile: Contracts.IProfile;
	showBalance?: boolean;
}) => {
	const address = option.value;

	const { t } = useTranslation();

	const { getWalletAlias } = useWalletAlias();

	const wallet = useMemo(
		() => profile.wallets().findByAddressWithNetwork(address, network?.id() ?? NetworkOption.Mainnet),
		[address, profile, network],
	);

	const { alias } = useMemo(
		() =>
			getWalletAlias({
				address,
				network,
				profile,
			}),
		[address, getWalletAlias, network, profile],
	);

	return (
		<Tooltip content={t("COMMON.DISABLED_DUE_INSUFFICIENT_BALANCE")} disabled={!option.isDisabled}>
			<div
				className={cn("flex flex-col sm:flex-row", {
					"cursor-not-allowed": option.isDisabled,
				})}
			>
				<div className="flex w-full items-center space-x-2 leading-5 whitespace-nowrap">
					<Address
						address={address}
						walletName={alias}
						addressClass={cn("leading-[17px] sm:leading-5 text-sm sm:text-base text-theme-secondary-500", {
							"dark:text-theme-dark-200 dim:text-theme-dim-200":
								!option.isSelected && option.isHighlighted && !option.isDisabled,
							"dark:text-theme-dark-500 dim:text-theme-dim-500":
								option.isSelected || (!option.isSelected && !option.isHighlighted),
							"text-theme-secondary-500 dark:text-theme-dark-500 dim:text-theme-dim-500":
								option.isDisabled,
						})}
						walletNameClass={cn("leading-[17px] sm:leading-5 text-sm sm:text-base ", {
							"text-theme-primary-600 dark:text-theme-secondary-50 dim:text-theme-dim-50":
								option.isSelected,
							"text-theme-secondary-500 dark:text-theme-dark-500 dim:text-theme-dim-500":
								option.isDisabled,
							"text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200":
								!option.isSelected && !option.isHighlighted && !option.isDisabled,
							"text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-50":
								!option.isSelected && option.isHighlighted && !option.isDisabled,
						})}
						wrapperClass={cn({
							"flex-1": showBalance,
						})}
						showTooltip={!option.isDisabled}
					/>

					{showBalance && (
						<Amount
							value={wallet?.balance() ?? 0}
							ticker={wallet?.network().ticker() ?? ""}
							className={cn("hidden flex-1 text-right font-semibold sm:inline-block", {
								"text-theme-secondary-500 dark:text-theme-dark-500 dim:text-theme-dim-500":
									option.isDisabled,
								"text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200":
									!option.isDisabled,
							})}
						/>
					)}

					<div className="h-4 w-4">
						{option.isSelected && (
							<Icon
								name="CheckmarkDouble"
								size="md"
								className={cn({
									"text-theme-primary-600 dark:text-theme-secondary-50 dim:text-theme-dim-50":
										!option.isDisabled,
									"text-theme-secondary-500 dark:text-theme-dark-500 dim:text-theme-dim-500":
										option.isDisabled,
								})}
							/>
						)}
					</div>
				</div>

				{showBalance && (
					<Amount
						value={wallet?.balance() ?? 0}
						ticker={wallet?.network().ticker() ?? ""}
						className={cn("mt-2 flex-1 text-sm font-semibold sm:hidden", {
							"text-theme-secondary-500 dark:text-theme-dark-500 dim:text-theme-dim-500":
								option.isDisabled,
							"text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200":
								!option.isDisabled,
						})}
					/>
				)}
			</div>
		</Tooltip>
	);
};

export const SelectAddressDropdown = React.forwardRef<HTMLInputElement, SelectAddressDropdownProperties>(
	(
		{
			wallet,
			profile,
			disabled,
			isInvalid,
			placeholder,
			onChange,
			wallets,
			defaultNetwork,
			showBalance = false,
			showOptions = true,
			disableAction = () => false,
		}: SelectAddressDropdownProperties,
		reference,
	) => {
		const { t } = useTranslation();

		const [searchWalletIsOpen, setSearchWalletIsOpen] = useState(false);

		const { getWalletAlias } = useWalletAlias();

		const selectReference = useRef<HTMLDivElement | null>(null);

		const fieldContext = useFormField();

		const isInvalidValue = isInvalid || fieldContext?.isInvalid;

		const recipientOptions =
			wallets?.map((wallet: Contracts.IReadWriteWallet) => ({
				isDisabled: disableAction(wallet),
				label: wallet.address(),
				value: wallet.address(),
			})) || [];

		const changeHandler = (option: any) => {
			const wallet = wallets.find((wallet: Contracts.IReadWriteWallet) => wallet.address() === option.value);

			return onChange?.(wallet);
		};

		const selectedAddressAlias = useMemo(() => {
			if (!wallet) {
				return;
			}

			return getWalletAlias({
				address: wallet?.address() ?? "",
				network: wallet?.network() ?? defaultNetwork,
				profile,
			});
		}, [wallet, profile, defaultNetwork]);

		const openRecipients = useCallback(() => {
			if (disabled) {
				return;
			}

			const dropdownWrapper = selectReference.current!.querySelector("[role=combobox]") as HTMLDivElement;
			// Necessary to ensure the select dropdown is hidden
			if (dropdownWrapper.getAttribute("aria-expanded") === "true") {
				const input = selectReference.current!.querySelector(
					"input#SelectAddressDropdown__dropdown-input",
				) as HTMLInputElement;
				input.focus();
				input.blur();
			}

			setSearchWalletIsOpen(true);
		}, [disabled, selectReference]);

		const handleSelectWallet = useCallback(
			(selectedWallet: SelectedWallet) => {
				setSearchWalletIsOpen(false);
				const wallet = wallets.find(
					(wallet: Contracts.IReadWriteWallet) => wallet.address() === selectedWallet.address,
				);
				onChange?.(wallet);
			},
			[setSearchWalletIsOpen, onChange],
		);

		return (
			<div>
				<div
					ref={selectReference}
					data-testid="SelectAddressDropdown__wrapper"
					className="relative flex w-full items-center text-left"
				>
					<Select
						id="SelectAddressDropdown__dropdown"
						showCaret={false}
						isInvalid={isInvalidValue}
						disabled={disabled}
						defaultValue={wallet?.address()}
						placeholder={placeholder || t("COMMON.ADDRESS")}
						ref={reference}
						options={showOptions ? recipientOptions : []}
						showOptions={showOptions}
						allowFreeInput={true}
						innerClassName="text-theme-secondary-500 dark:text-theme-secondary-700 dim:text-theme-dim-200"
						onChange={changeHandler}
						addons={{
							end: showOptions
								? {
										content: (
											<div
												data-testid="SelectRecipient__select-recipient"
												className={cn("flex items-center", {
													"text-theme-secondary-700 hover:bg-theme-primary-100 hover:text-theme-primary-700 dark:text-theme-secondary-600 dark:hover:bg-theme-secondary-700 dim:text-theme-dim-200 dim-hover:bg-theme-dim-700 dim-hover:text-theme-dim-50 cursor-pointer rounded bg-transparent p-1 transition-colors dark:hover:text-white":
														!disabled,
												})}
												onClick={openRecipients}
											>
												<Icon name="User" size="lg" />
											</div>
										),
									}
								: undefined,
							start: selectedAddressAlias?.alias
								? {
										content: (
											<div className="flex items-center">
												{selectedAddressAlias?.alias && (
													<TruncateEnd text={selectedAddressAlias.alias} showTooltip />
												)}
											</div>
										),
									}
								: undefined,
						}}
						renderLabel={(option) => (
							<OptionLabel
								option={option}
								network={wallet?.network() ?? defaultNetwork}
								profile={profile}
								showBalance={showBalance}
							/>
						)}
					/>
				</div>

				<SearchWallet
					isOpen={searchWalletIsOpen}
					profile={profile}
					title={t("PROFILE.MODAL_SELECT_SENDER.TITLE")}
					description={t("PROFILE.MODAL_SELECT_SENDER.DESCRIPTION")}
					disableAction={disableAction}
					searchPlaceholder={t("PROFILE.MODAL_SELECT_SENDER.SEARCH_PLACEHOLDER")}
					wallets={wallets}
					size="3xl"
					showNetwork={false}
					onSelectWallet={handleSelectWallet}
					onClose={() => setSearchWalletIsOpen(false)}
					selectedAddress={wallet?.address()}
				/>
			</div>
		);
	},
);

SelectAddressDropdown.displayName = "SelectAddressDropdown";
