import { Contracts } from "@/app/lib/profiles";
import React, { ChangeEvent, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { FormField, FormLabel } from "@/app/components/Form";
import { InputCounter } from "@/app/components/Input";
import { SelectAddressDropdown } from "@/domains/profile/components/SelectAddressDropdown";
import { useActiveNetwork } from "@/app/hooks/use-active-network";

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

	return (
		<section className="space-y-4">
			<FormField name="signatory-address">
				<FormLabel label={t("COMMON.SIGNING_ADDRESS")} />

				<SelectAddressDropdown
					disabled={disabled}
					profile={profile}
					placeholder={t("EXCHANGE.EXCHANGE_FORM.RECIPIENT_PLACEHOLDER")}
					onChange={handleRecipientWalletChange}
					wallets={wallets}
					wallet={wallet}
					defaultNetwork={activeNetwork}
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
