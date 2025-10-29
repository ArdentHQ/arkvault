import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button } from "@/app/components/Button";
import { Form, FormButtons, FormField, FormLabel } from "@/app/components/Form";
import { InputPassword } from "@/app/components/Input";
import { Modal } from "@/app/components/Modal";

interface PasswordModalProperties {
	title: string;
	description: string;
	isOpen: boolean;
	onClose?: any;
	onSubmit?: (password: string) => void;
}

export const PasswordModal = ({ isOpen, title, description, onClose, onSubmit }: PasswordModalProperties) => {
	const { t } = useTranslation();
	const form = useForm({ mode: "onChange" });
	const { password } = form.watch();

	return (
		<Modal
			title={title}
			titleClass="items-left"
			description={description}
			size="2xl"
			isOpen={isOpen}
			onClose={onClose}
		>
			<Form context={form} onSubmit={() => onSubmit?.(password)} className="mt-8">
				<FormField name="password">
					<FormLabel label={t("SETTINGS.GENERAL.PERSONAL.PASSWORD")} />
					<InputPassword
						ref={form.register({
							required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
								field: t("COMMON.PASSWORD"),
							}).toString(),
						})}
						data-testid="PasswordModal__input"
					/>
				</FormField>


				<div className="modal-footer">
				<FormButtons>
					<Button data-testid="PasswordModal__submit-button" type="submit" disabled={!form.formState.isValid}>
						{t("COMMON.CONFIRM")}
					</Button>
				</FormButtons>
				</div>
			</Form>
		</Modal>
	);
};
