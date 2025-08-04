import { Contracts } from "@/app/lib/profiles";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useEnvironmentContext } from "@/app/contexts";
import React, { useMemo } from "react";
import { alias } from "@/domains/wallet/validations";
import { Form, FormField, FormLabel } from "@/app/components/Form";
import { Input } from "@/app/components/Input";
import { Button } from "@/app/components/Button";
import { Divider } from "@/app/components/Divider";

interface UpdateAddressNameProperties {
	onAfterSave: () => void;
	onCancel: () => void;
	profile: Contracts.IProfile;
	wallet: Contracts.IReadWriteWallet;
}

interface UpdateAddressNameState {
	name: string;
}

export const UpdateAddressName = ({ onAfterSave, onCancel, profile, wallet }: UpdateAddressNameProperties) => {
	const getDefaultValues = (): UpdateAddressNameState => ({
		name: wallet.alias() as string,
	});

	const form = useForm<UpdateAddressNameState>({
		defaultValues: getDefaultValues(),
		mode: "onChange",
	});

	const { formState, register } = form;
	const { isValid, errors, isDirty, dirtyFields } = formState;

	const { t } = useTranslation();
	const { persist } = useEnvironmentContext();

	const isChanged = useMemo(() => isDirty && Object.keys(dirtyFields).length > 0, [isDirty, dirtyFields]);

	const aliasValidation = alias({ profile, t, walletAddress: wallet.address() });

	const onSubmit = async ({ name }: UpdateAddressNameState) => {
		wallet.mutator().alias(name);
		await persist();

		onAfterSave();
	};

	return (
		<Form context={form} onSubmit={onSubmit} className="px-6 py-4 bg-theme-secondary-100 rounded-b-lg">
			<FormField name="name">
				<FormLabel>{t("WALLETS.WALLET_NAME")}</FormLabel>
				<div className="relative">
					<Input
						autoFocus
						errorMessage={errors.name?.message}
						isInvalid={!isValid}
						data-testid="UpdateWalletName__input"
						ref={register(aliasValidation)}
					/>
				</div>
			</FormField>

			<div className="mt-4 flex w-full items-center justify-center leading-[18px] sm:justify-end sm:leading-5">
				<Button
					data-testid="UpdateWalletName__cancel"
					size="icon"
					variant="transparent"
					onClick={onCancel}
					className="text-theme-primary-600 dark:text-theme-primary-400 dim:text-theme-dim-navy-400 px-2 py-[3px] text-sm leading-[18px] sm:text-base sm:leading-5"
				>
					{t("COMMON.CANCEL")}
				</Button>

				<Divider
					type="vertical"
					className="border-theme-secondary-400 dark:border-theme-dark-600 dim:border-theme-dim-600 mx-3"
				/>

				<Button
					type="submit"
					size="icon"
					variant="transparent"
					data-testid="UpdateWalletName__submit"
					disabled={!isValid || !isChanged}
					className="text-theme-primary-600 dark:text-theme-primary-400 dim:text-theme-dim-navy-400 px-2 py-[3px] text-sm leading-[18px] sm:text-base sm:leading-5"
				>
					{t("COMMON.SAVE")}
				</Button>
			</div>
		</Form>
	);
};

