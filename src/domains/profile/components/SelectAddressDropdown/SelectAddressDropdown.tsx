import { Networks } from "@/app/lib/mainsail";
import { Contracts } from "@/app/lib/profiles";
import cn from "classnames";
import React, { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Address } from "@/app/components/Address";
import { useFormField } from "@/app/components/Form/useFormField";
import { Select } from "@/app/components/SelectDropdown";
import { TruncateEnd } from "@/app/components/TruncateEnd";
import { useWalletAlias } from "@/app/hooks/use-wallet-alias";
import { Icon } from "@/app/components/Icon";

type SelectAddressDropdownProperties = {
	wallet?: Contracts.IReadWriteWallet;
	wallets: Contracts.IReadWriteWallet[];
	defaultNetwork?: Networks.Network;
	profile: Contracts.IProfile;
	disabled?: boolean;
	isInvalid?: boolean;
	placeholder?: string;
	onChange?: (wallet?: Contracts.IReadWriteWallet) => void;
} & Omit<React.InputHTMLAttributes<any>, "onChange">;

export const OptionLabel = ({
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
		<div className="flex items-center space-x-2 leading-5 whitespace-nowrap">
			<Address
				address={address}
				walletName={alias}
				addressClass={cn("leading-[17px] sm:leading-5 text-sm sm:text-base text-theme-secondary-500", {
					"dark:text-theme-dark-200 dim:text-theme-dim-200": !option.isSelected && option.isHighlighted,
					"dark:text-theme-dark-500 dim:text-theme-dim-500":
						option.isSelected || (!option.isSelected && !option.isHighlighted),
				})}
				walletNameClass={cn("leading-[17px] sm:leading-5 text-sm sm:text-base ", {
					"text-theme-primary-600 dark:text-theme-secondary-50 dim:text-theme-dim-50": option.isSelected,
					"text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200":
						!option.isSelected && !option.isHighlighted,
					"text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-50":
						!option.isSelected && option.isHighlighted,
				})}
			/>

			<div className="h-4 w-4">
				{option.isSelected && (
					<Icon
						name="CheckmarkDouble"
						size="md"
						className="text-theme-primary-600 dark:text-theme-secondary-50 dim:text-theme-dim-50"
					/>
				)}
			</div>
		</div>
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
		}: SelectAddressDropdownProperties,
		reference,
	) => {
		const { t } = useTranslation();

		const { getWalletAlias } = useWalletAlias();

		const selectReference = useRef<HTMLDivElement | null>(null);

		const fieldContext = useFormField();

		const isInvalidValue = isInvalid || fieldContext?.isInvalid;

		const recipientOptions =
			wallets?.map((wallet: Contracts.IReadWriteWallet) => ({
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
						options={recipientOptions}
						showOptions={true}
						allowFreeInput={true}
						innerClassName="text-theme-secondary-500 dark:text-theme-secondary-700 dim:text-theme-dim-200"
						onChange={changeHandler}
						addons={{
							end: undefined,
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
							/>
						)}
					/>
				</div>
			</div>
		);
	},
);

SelectAddressDropdown.displayName = "SelectAddressDropdown";
