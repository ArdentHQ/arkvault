import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import cn from "classnames";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useTranslation } from "react-i18next";
import { Address } from "@/app/components/Address";
import { Avatar } from "@/app/components/Avatar";
import { Circle } from "@/app/components/Circle";
import { useFormField } from "@/app/components/Form/useFormField";
import { Icon } from "@/app/components/Icon";
import { Select } from "@/app/components/SelectDropdown";
import { TruncateEnd } from "@/app/components/TruncateEnd";
import { useWalletAlias, WalletAliasResult } from "@/app/hooks/use-wallet-alias";
import { AddressProperties, useProfileAddresses } from "@/domains/profile/hooks/use-profile-addresses";
import { SearchRecipient } from "@/domains/transaction/components/SearchRecipient";

type SelectRecipientProperties = {
	network?: Networks.Network;
	address?: string;
	profile: Contracts.IProfile;
	disabled?: boolean;
	isInvalid?: boolean;
	showOptions?: boolean;
	showWalletAvatar?: boolean;
	contactSearchTitle?: string;
	contactSearchDescription?: string;
	placeholder?: string;
	exceptMultiSignature?: boolean;
	onChange?: (address: string | undefined, alias: WalletAliasResult) => void;
} & Omit<React.InputHTMLAttributes<any>, "onChange">;

const ProfileAvatar = ({ address }: any) => {
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

const OptionLabel = ({
	option,
	network,
	profile,
}: {
	option: any;
	network?: Networks.Network;
	profile: Contracts.IProfile;
}) => {
	const address = option.value;

	const { getWalletAlias } = useWalletAlias();

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
		<Address
			address={address}
			walletName={alias}
			addressClass={cn({ "text-theme-primary-600": !alias && option.isSelected })}
			walletNameClass={cn({ "text-theme-primary-600": option.isSelected })}
			truncateOnTable
		/>
	);
};

export const SelectRecipient = React.forwardRef<HTMLInputElement, SelectRecipientProperties>(
	(
		{
			address,
			profile,
			disabled,
			isInvalid,
			showOptions = true,
			showWalletAvatar = true,
			network,
			placeholder,
			exceptMultiSignature,
			onChange,
			contactSearchTitle,
			contactSearchDescription,
		}: SelectRecipientProperties,
		reference,
	) => {
		const { t } = useTranslation();

		const { getWalletAlias } = useWalletAlias();

		const [isRecipientSearchOpen, setIsRecipientSearchOpen] = useState(false);

		const selectRecipientReference = useRef<HTMLDivElement | null>(null);

		/*
		 * Initial value for selected address is set in useEffect below via onChangeAddress.
		 * This is made to also retrieve alias information of the selected address.
		 */
		const [selectedAddress, setSelectedAddress] = useState<string | undefined>();
		const [selectedAddressAlias, setSelectedAddressAlias] = useState<WalletAliasResult | undefined>();

		const fieldContext = useFormField();

		const onChangeAddress = useCallback(
			(addressValue: string | undefined, emitOnChange = true) => {
				if (addressValue === selectedAddress) {
					return;
				}

				const alias = getWalletAlias({
					address: addressValue ?? "",
					network,
					profile,
				});

				setSelectedAddress(addressValue);
				setSelectedAddressAlias(alias);

				if (emitOnChange) {
					onChange?.(addressValue, alias);
				}
			},
			[getWalletAlias, network, onChange, profile, selectedAddress],
		);

		const isInvalidValue = isInvalid || fieldContext?.isInvalid;

		// Modify the address from parent component
		useEffect(() => {
			onChangeAddress(address, false);
		}, [address]); // eslint-disable-line react-hooks/exhaustive-deps

		const { allAddresses } = useProfileAddresses({ network, profile }, exceptMultiSignature);

		const recipientOptions = allAddresses.map(({ address }: AddressProperties) => ({
			label: address,
			value: address,
		}));

		const openRecipients = useCallback(() => {
			if (disabled) {
				return;
			}

			const dropdownWrapper = selectRecipientReference.current!.querySelector(
				"[role=combobox]",
			) as HTMLDivElement;
			// Necessary to ensure the select dropdown is hidden
			if (dropdownWrapper.getAttribute("aria-expanded") === "true") {
				const input = selectRecipientReference.current!.querySelector(
					"input#SelectRecipient__dropdown-input",
				) as HTMLInputElement;
				input.focus();
				input.blur();
			}

			setIsRecipientSearchOpen(true);
		}, [disabled, selectRecipientReference]);

		const onAction = useCallback(
			(changedAddress: string) => {
				onChangeAddress(changedAddress);
				setIsRecipientSearchOpen(false);
			},
			[onChangeAddress, setIsRecipientSearchOpen],
		);

		return (
			<div>
				<div
					ref={selectRecipientReference}
					data-testid="SelectRecipient__wrapper"
					className="relative flex w-full items-center text-left"
				>
					<Select
						id="SelectRecipient__dropdown"
						showCaret={false}
						isInvalid={isInvalidValue}
						disabled={disabled}
						defaultValue={selectedAddress}
						placeholder={placeholder || t("COMMON.ADDRESS")}
						ref={reference}
						options={showOptions ? recipientOptions : []}
						showOptions={showOptions}
						allowFreeInput={true}
						onChange={(option: any) => onChangeAddress(option.value)}
						addons={{
							end: showOptions
								? {
										content: (
											<div
												data-testid="SelectRecipient__select-recipient"
												className={cn("flex items-center", { "cursor-pointer": !disabled })}
												onClick={openRecipients}
											>
												<Icon name="User" size="lg" />
											</div>
										),
									}
								: undefined,
							start: showWalletAvatar
								? {
										content: (
											<div className="flex items-center">
												<ProfileAvatar address={selectedAddress} />
												{!!selectedAddressAlias?.alias && (
													<TruncateEnd
														className="ml-2 font-semibold"
														text={selectedAddressAlias.alias}
														showTooltip
													/>
												)}
											</div>
										),
									}
								: undefined,
						}}
						renderLabel={(option) => <OptionLabel option={option} network={network} profile={profile} />}
					/>
				</div>

				<SearchRecipient
					title={contactSearchTitle}
					description={contactSearchDescription}
					isOpen={isRecipientSearchOpen}
					recipients={allAddresses}
					onAction={onAction}
					onClose={() => setIsRecipientSearchOpen(false)}
					selectedAddress={selectedAddress}
					profile={profile}
				/>
			</div>
		);
	},
);

SelectRecipient.displayName = "SelectRecipient";
