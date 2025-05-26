import { Contracts } from "@/app/lib/profiles";
import React, { ChangeEvent, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { FormField, FormLabel } from "@/app/components/Form";
import { InputCounter } from "@/app/components/Input";
import { SelectAddress } from "@/domains/profile/components/SelectAddress";

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

	return (
		<section className="space-y-4">
			<FormField name="signatory-address">
				<FormLabel label={t("COMMON.SIGNING_WALLET")} />

				<SelectAddress
					showWalletAvatar={false}
					title={t("MESSAGE.PAGE_SIGN_MESSAGE.FORM_STEP.SELECT_ADDRESS_TITLE")}
					description={t("MESSAGE.PAGE_SIGN_MESSAGE.FORM_STEP.SELECT_ADDRESS_DESCRIPTION")}
					wallet={
						wallet
							? {
									address: wallet.address(),
									network: wallet.network(),
								}
							: undefined
					}
					wallets={wallets}
					profile={profile}
					disabled={disabled}
					disableAction={() => false}
					onChange={handleSelectAddress}
				/>
			</FormField>

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
