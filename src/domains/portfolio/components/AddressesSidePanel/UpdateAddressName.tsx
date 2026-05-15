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
import { WalletSetting } from "@/app/lib/profiles/wallet.enum";

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
		name: wallet.settings().get(WalletSetting.Alias) as string,
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
		<Form
			context={form}
			onSubmit={onSubmit}
			className="rounded-b border-b border-theme-secondary-300 bg-theme-secondary-100 px-4 py-3 dim:border-theme-dim-700 dim:bg-theme-dim-800 dark:border-theme-dark-700 dark:bg-theme-dark-800 sm:rounded-b-lg sm:border-b-0 sm:px-6 sm:py-4"
		>
			<FormField name="name">
				<FormLabel>{t("COMMON.NAME")}</FormLabel>
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

			<div className="mt-4 flex w-full items-center justify-end leading-[18px] sm:leading-5">
				<Button
					data-testid="UpdateWalletName__cancel"
					size="icon"
					variant="transparent"
					onClick={onCancel}
					className="px-2 py-[3px] leading-5 text-theme-primary-600 dim:text-theme-dim-navy-400 dark:text-theme-primary-400"
				>
					{t("COMMON.CANCEL")}
				</Button>

				<Divider
					type="vertical"
					className="mx-3 border-theme-secondary-400 dim:border-theme-dim-600 dark:border-theme-dark-600"
				/>

				<Button
					type="submit"
					size="icon"
					variant="transparent"
					data-testid="UpdateWalletName__submit"
					disabled={!isValid || !isChanged}
					className="px-2 py-[3px] leading-5 text-theme-primary-600 dim:text-theme-dim-navy-400 dark:text-theme-primary-400"
				>
					{t("COMMON.SAVE")}
				</Button>
			</div>
		</Form>
	);
};
