import { Contracts } from "@/app/lib/profiles";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useEnvironmentContext } from "@/app/contexts";
import React, { useMemo } from "react";
import { FormField, FormLabel } from "@/app/components/Form";
import { Input } from "@/app/components/Input";
import { Button } from "@/app/components/Button";
import { Divider } from "@/app/components/Divider";
import { accountName } from "@/domains/wallet/validations/AccountName";

interface UpdateAddressNameProperties {
	onAfterSave: () => void;
	onCancel: () => void;
	profile: Contracts.IProfile;
	wallets: Contracts.IReadWriteWallet[];
}

interface UpdateAddressNameState {
	name: string;
}

export const UpdateAccountName = ({ onAfterSave, onCancel, profile, wallets }: UpdateAddressNameProperties) => {
	const currentAccountName = wallets.at(0)!.accountName() as string;

	const getDefaultValues = (): UpdateAddressNameState => ({
		name: currentAccountName,
	});

	const form = useForm<UpdateAddressNameState>({
		defaultValues: getDefaultValues(),
		mode: "onChange",
	});

	const { formState, register, handleSubmit } = form;
	const { isValid, errors, isDirty, dirtyFields } = formState;

	const { t } = useTranslation();
	const { persist } = useEnvironmentContext();

	const isChanged = useMemo(() => isDirty && Object.keys(dirtyFields).length > 0, [isDirty, dirtyFields]);

	const nameValidation = accountName({ currentAccountName, profile, t });

	const onSubmit = async ({ name }: UpdateAddressNameState) => {
		const hdWallets = profile
			.wallets()
			.values()
			.filter((hdWallet) => hdWallet.accountName() === currentAccountName);

		for (const wallet of hdWallets) {
			wallet.mutator().accountName(name);
		}

		await persist();

		onAfterSave();
	};

	return (
		<FormProvider {...form}>
			<div className="bg-theme-secondary-100 border-theme-secondary-300 dark:bg-theme-dark-800 dark:border-theme-dark-700 dim:bg-theme-dim-800 dim:border-theme-dim-700 rounded border px-4 py-3 sm:rounded-t-none sm:rounded-b-lg sm:border-0 sm:px-6 sm:py-4">
				<FormField name="name">
					<FormLabel>{t("COMMON.NAME")}</FormLabel>
					<div className="relative">
						<Input
							autoFocus
							errorMessage={errors.name?.message}
							isInvalid={!isValid}
							data-testid="UpdateWalletName__input"
							ref={register(nameValidation)}
						/>
					</div>
				</FormField>

				<div className="mt-4 flex w-full items-center justify-end leading-[18px] sm:leading-5">
					<Button
						data-testid="UpdateWalletName__cancel"
						size="icon"
						variant="transparent"
						onClick={onCancel}
						className="text-theme-primary-600 dark:text-theme-primary-400 dim:text-theme-dim-navy-400 px-2 py-[3px] leading-5"
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
						onClick={handleSubmit(onSubmit)}
						disabled={!isValid || !isChanged}
						className="text-theme-primary-600 dark:text-theme-primary-400 dim:text-theme-dim-navy-400 px-2 py-[3px] leading-5"
					>
						{t("COMMON.SAVE")}
					</Button>
				</div>
			</div>
		</FormProvider>
	);
};
