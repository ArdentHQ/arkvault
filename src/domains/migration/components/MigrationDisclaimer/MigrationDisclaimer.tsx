import React, { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { FormButtons, FormField } from "@/app/components/Form";
import { Modal } from "@/app/components/Modal";
import { Image } from "@/app/components/Image";
import { Button } from "@/app/components/Button";
import { Alert } from "@/app/components/Alert";
import { Checkbox } from "@/app/components/Checkbox";
import { Link } from "@/app/components/Link";

interface MigrationDisclaimerProperties {
	isOpen: boolean;
	onClose?: () => void;
	onCancel?: () => void;
	onConfirm: () => void;
}

const PRIVACY_POLICY_URL = "https://arkvault.io/privacy-policy";
const TERMS_URL = "http://arkvault.io/terms-of-service";

export const MigrationDisclaimer = ({ onClose, onCancel, onConfirm, isOpen }: MigrationDisclaimerProperties) => {
	const [disabled, setDisabled] = useState<boolean>(true);

	useEffect(() => {
		setDisabled(true);
	}, [isOpen]);

	const agreeCheckboxHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
		setDisabled(!event.target.checked);
	};

	const { t } = useTranslation();

	return (
		<Modal
			title={t("MIGRATION.DISCLAIMER_MODAL.TITLE")}
			image={<Image name="Warning" useAccentColor={false} className="my-8 mx-auto max-w-52" />}
			size="2xl"
			isOpen={isOpen}
			onClose={onClose}
		>
			<Alert>{t("MIGRATION.DISCLAIMER_MODAL.WARNING")}</Alert>

			<div className="pt-4">
				<FormField name="agree">
					<label className="flex cursor-pointer items-start space-x-3">
						<Checkbox
							className="pt-1"
							data-testid="MigrationDisclaimer-checkbox"
							name="agree"
							onChange={agreeCheckboxHandler}
						/>
						<span className="whitespace-pre-line text-sm text-theme-secondary-700 dark:text-theme-secondary-600">
							<Trans
								i18nKey="MIGRATION.DISCLAIMER_MODAL.DISCLAIMER"
								components={{
									linkPrivacyPolicy: <Link to={PRIVACY_POLICY_URL} isExternal />,
									linkTerms: <Link to={TERMS_URL} isExternal />,
								}}
							/>
						</span>
					</label>
				</FormField>
			</div>

			<FormButtons>
				<Button variant="secondary" onClick={onCancel} data-testid="MigrationDisclaimer__cancel-button">
					{t("COMMON.CANCEL")}
				</Button>

				<Button
					disabled={disabled}
					type="submit"
					onClick={onConfirm}
					variant="primary"
					data-testid="MigrationDisclaimer__submit-button"
				>
					<span>{t("COMMON.CONFIRM")}</span>
				</Button>
			</FormButtons>
		</Modal>
	);
};
