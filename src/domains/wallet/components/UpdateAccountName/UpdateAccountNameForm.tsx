import { Contracts } from "@/app/lib/profiles";
import React, { ReactElement, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button } from "@/app/components/Button";
import { Form, FormButtons, FormField, FormLabel } from "@/app/components/Form";
import { Input } from "@/app/components/Input";
import { useEnvironmentContext } from "@/app/contexts";
import { accountName } from "@/domains/wallet/validations/AccountName";
import { twMerge } from "tailwind-merge";

export interface UpdateWalletNameProperties {
	onAfterSave: () => void;
	onCancel: () => void;
	profile: Contracts.IProfile;
	wallet: Contracts.IReadWriteWallet;
	children?: ReactElement;
	className?: string;
}

interface UpdateWalletNameState {
	name: string;
}

export const UpdateAccountNameForm = ({
	onAfterSave,
	onCancel,
	profile,
	wallet,
	children,
	className,
}: UpdateWalletNameProperties) => {
	const getDefaultValues = (): UpdateWalletNameState => ({
		name: wallet.accountName()!,
	});

	const form = useForm<UpdateWalletNameState>({
		defaultValues: getDefaultValues(),
		mode: "onChange",
	});

	const { formState, register } = form;
	const { isValid, errors, isDirty, dirtyFields } = formState;

	const { t } = useTranslation();
	const { persist } = useEnvironmentContext();

	const isChanged = useMemo(() => isDirty && Object.keys(dirtyFields).length > 0, [isDirty, dirtyFields]);

	const nameValidation = accountName({ currentAccountName: wallet.accountName()!, profile, t });

	const onSubmit = async ({ name }: UpdateWalletNameState) => {
		const wallets = profile
			.wallets()
			.values()
			.filter((hdWallet) => wallet.accountName() === hdWallet.accountName());

		for (const wallet of wallets) {
			wallet.mutator().accountName(name);
		}

		await persist();

		onAfterSave();
	};

	return (
		<Form context={form} onSubmit={onSubmit} className={twMerge("mt-4 space-y-6", className)}>
			<FormField name="name">
				<FormLabel>{t("COMMON.ACCOUNT_NAME")}</FormLabel>
				<div className="relative">
					<Input
						autoFocus
						errorMessage={errors.name?.message}
						isInvalid={!isValid}
						data-testid="UpdateWalletAccountName__input"
						ref={register(nameValidation)}
					/>
				</div>
			</FormField>

			{children || (
				<div className="border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 modal-footer -mx-6 px-6 sm:border-t">
					<FormButtons>
						<Button data-testid="UpdateWalletName__cancel" variant="secondary" onClick={onCancel}>
							{t("COMMON.CANCEL")}
						</Button>

						<Button type="submit" data-testid="UpdateWalletName__submit" disabled={!isValid || !isChanged}>
							{t("COMMON.SAVE")}
						</Button>
					</FormButtons>
				</div>
			)}
		</Form>
	);
};
