import { Contracts } from "@/app/lib/profiles";
import React, { ChangeEvent, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { FormField, FormLabel } from "@/app/components/Form";
import { InputCounter } from "@/app/components/Input";
import { SelectAddressDropdown } from "@/domains/profile/components/SelectAddressDropdown";
import { useActiveNetwork } from "@/app/hooks/use-active-network";
import { DetailWrapper } from "@/app/components/DetailWrapper";
import { Address } from "@/app/components/Address";
import { useWalletAlias } from "@/app/hooks";
export const FormStep = ({
	disabled,
	wallet,
	wallets,
	disableMessageInput,
	maxLength,
	profile,
	handleSelectAddress,
}: {
	profile: Contracts.IProfile;
	disabled: boolean;
	wallet?: Contracts.IReadWriteWallet;
	wallets: Contracts.IReadWriteWallet[];
	disableMessageInput?: boolean;
	maxLength: number;
	handleSelectAddress: ((address: string) => void) & React.ChangeEventHandler<any>;
}) => {
	const { t } = useTranslation();

	const { setValue, unregister, watch } = useFormContext();
	const { message } = watch();

	useEffect(() => {
		unregister("mnemonic");
	}, [unregister]);

	const handleRecipientWalletChange = (wallet?: Contracts.IReadWriteWallet) => {
		handleSelectAddress(wallet?.address() || "");
	};

	const { activeNetwork } = useActiveNetwork({ profile });

	const { getWalletAlias } = useWalletAlias();

	return (
		<section className="space-y-4">
			{wallets.length > 1 ? (
				<FormField name="signatory-address">
					<FormLabel textClassName="text-base" label={t("COMMON.SIGNING_ADDRESS")} />
					<SelectAddressDropdown
						disabled={disabled}
						profile={profile}
						onChange={handleRecipientWalletChange}
						wallets={wallets}
						wallet={wallet}
						defaultNetwork={activeNetwork}
					/>
				</FormField>
			) : (
				<DetailWrapper label={t("COMMON.SIGNING_ADDRESS")}>
					<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
						<Address
							truncateOnTable
							address={wallet?.address()}
							walletName={
								getWalletAlias({
									address: wallet?.address() ?? "",
									network: wallet?.network() ?? activeNetwork,
									profile,
								}).alias
							}
							showCopyButton
							walletNameClass="text-theme-text text-sm leading-[17px] sm:leading-5 sm:text-base"
							addressClass="text-theme-secondary-500 dark:text-theme-secondary-700 dim:text-theme-dim-700 text-sm leading-[17px] sm:leading-5 sm:text-base w-full w-3/4"
							wrapperClass="justify-end sm:justify-start"
						/>
					</div>
				</DetailWrapper>
			)}

			<FormField name="message">
				<FormLabel label={t("COMMON.MESSAGE")} />
				<InputCounter
					defaultValue={message}
					onChange={(event: ChangeEvent<HTMLInputElement>) =>
						setValue("message", event.target.value, {
							shouldDirty: true,
							shouldValidate: true,
						})
					}
					data-testid="SignMessage__message-input"
					readOnly={disableMessageInput}
					maxLengthLabel={maxLength.toString()}
				/>
			</FormField>
		</section>
	);
};
