import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { ContactFormProperties, ContactFormState } from "./ContactForm.contracts";
import { Button } from "@/app/components/Button";
import { Form, FormButtons, FormField, FormLabel } from "@/app/components/Form";
import { Icon } from "@/app/components/Icon";
import { InputAddress, InputDefault } from "@/app/components/Input";
import { useBreakpoint } from "@/app/hooks";
import { contactForm } from "@/domains/contact/validations/ContactForm";
import { AddressService } from "@/app/lib/mainsail/address.service";

export const ContactForm = ({
	profile,
	contact,
	onChange,
	onCancel,
	onDelete,
	onSave,
	errors,
}: ContactFormProperties) => {
	const { t } = useTranslation();
	const { isXs } = useBreakpoint();

	const form = useForm<ContactFormState>({
		defaultValues: {
			address: contact?.addresses().first().address() ?? "",
			name: contact?.name() ?? "",
		},
		mode: "onChange",
	});

	const { formState, register, setError, watch } = form;
	const { isValid } = formState;

	const { name, address } = watch();

	const contactFormValidation = contactForm(t, profile);

	useEffect(() => {
		for (const [field, message] of Object.entries(errors) as [keyof ContactFormState, string][]) {
			setError(field, { message, type: "manual" });
		}
	}, [errors, setError]);

	return (
		<Form
			data-testid="contact-form"
			context={form}
			onSubmit={() =>
				onSave({
					address: {
						address: address,
						name: address,
					},
					name,
				})
			}
		>
			<FormField name="name">
				<FormLabel>{t("CONTACTS.CONTACT_FORM.NAME")}</FormLabel>
				<InputDefault
					data-testid="contact-form__name-input"
					ref={register(contactFormValidation.name(contact?.id()))}
					onChange={() => onChange("name")}
					defaultValue={contact?.name()}
				/>
			</FormField>

			<FormField name="address" data-testid="ContactForm__address">
				<FormLabel>{t("CONTACTS.CONTACT_FORM.ADDRESS")}</FormLabel>

				<InputAddress
					profile={profile}
					registerRef={register}
					useDefaultRules={false}
					additionalRules={{
						required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
							field: t("COMMON.ADDRESS"),
						}).toString(),
						validate: {
							duplicateAddress: (address) => {
								const isForThisContact =
									contact && contact.addresses().findByAddress(address).length > 0;

								const isForOtherContact = profile.contacts().findByAddress(address).length > 0;

								return (
									isForThisContact ||
									!isForOtherContact ||
									t("COMMON.INPUT_ADDRESS.VALIDATION.ADDRESS_ALREADY_EXISTS", {
										address,
									}).toString()
								);
							},
							validAddress: (address?: string) => {
								if (!address) {
									return t("COMMON.VALIDATION.FIELD_REQUIRED", {
										field: t("COMMON.ADDRESS"),
									}).toString();
								}

								const isValidAddress: boolean = new AddressService().validate(address);

								if (!isValidAddress) {
									return t("CONTACTS.VALIDATION.ADDRESS_IS_INVALID").toString();
								}

								return true;
							},
						},
					}}
					onChange={() => onChange("address")}
					data-testid="contact-form__address-input"
				/>
			</FormField>

			<div
				className={`border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 -mx-6 flex px-6 sm:border-t ${
					contact ? "justify-between" : "justify-end"
				}`}
			>
				{contact && !isXs && (
					<Button
						data-testid="contact-form__delete-btn"
						className="mt-0 h-min sm:mt-4"
						onClick={onDelete}
						variant="danger"
					>
						<Icon name="Trash" />
						<span>{t("CONTACTS.CONTACT_FORM.DELETE_CONTACT")}</span>
					</Button>
				)}

				<div>
					<FormButtons className="border-none sm:mt-4">
						<Button data-testid="contact-form__cancel-btn" variant="secondary" onClick={onCancel}>
							{t("COMMON.CANCEL")}
						</Button>

						<Button
							data-testid="contact-form__save-btn"
							type="submit"
							variant="primary"
							disabled={!isValid}
						>
							{t("COMMON.SAVE")}
						</Button>
					</FormButtons>
				</div>
			</div>
		</Form>
	);
};
