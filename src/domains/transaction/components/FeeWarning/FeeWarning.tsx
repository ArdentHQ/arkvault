import React from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Alert } from "@/app/components/Alert";
import { Button } from "@/app/components/Button";
import { Checkbox } from "@/app/components/Checkbox";
import { FormButtons, FormField } from "@/app/components/Form";
import { Image } from "@/app/components/Image";
import { Modal } from "@/app/components/Modal";

export enum FeeWarningVariant {
	Low = "LOW",
	High = "HIGH",
}

interface FeeWarningProperties {
	isOpen: boolean;
	variant?: FeeWarningVariant;
	onCancel: (suppressWarning: boolean) => Promise<void>;
	onConfirm: (suppressWarning: boolean) => Promise<void>;
}

export const FeeWarning = ({ isOpen, variant, onCancel, onConfirm }: FeeWarningProperties) => {
	const { t } = useTranslation();

	const { setValue, getValues, watch } = useFormContext();

	const { suppressWarning } = watch();

	return (
		<Modal
			isOpen={isOpen}
			title={t("TRANSACTION.MODAL_FEE_WARNING.TITLE")}
			image={<Image name="Warning" useAccentColor={false} className="my-8 mx-auto max-w-52" />}
			size="lg"
			onClose={() => onCancel(true)}
		>
			<Alert>{variant && t(`TRANSACTION.MODAL_FEE_WARNING.DESCRIPTION.TOO_${variant}`)}</Alert>

			<div className="mt-4">
				<FormField name="suppressWarning">
					<label className="flex w-max cursor-pointer items-center space-x-3">
						<Checkbox
							name="suppressWarning"
							data-testid="FeeWarning__suppressWarning-toggle"
							onChange={() => setValue("suppressWarning", !suppressWarning)}
						/>
						<span className="text-sm text-theme-secondary-500 dark:text-theme-secondary-700">
							{t("TRANSACTION.MODAL_FEE_WARNING.DO_NOT_WARN")}
						</span>
					</label>
				</FormField>
			</div>

			<FormButtons>
				<Button
					variant="secondary"
					onClick={() => onCancel(!!getValues("suppressWarning"))}
					data-testid="FeeWarning__cancel-button"
				>
					{t("COMMON.CANCEL")}
				</Button>

				<Button
					data-testid="FeeWarning__continue-button"
					onClick={() => onConfirm(!!getValues("suppressWarning"))}
				>
					{t("COMMON.CONTINUE")}
				</Button>
			</FormButtons>
		</Modal>
	);
};
