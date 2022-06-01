import { Contracts } from "@payvo/sdk-profiles";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { Modal } from "@/app/components/Modal";
import { useEnvironmentContext } from "@/app/contexts";
import { ContactForm } from "@/domains/contact/components/ContactForm";
import { ContactFormData, ContactFormState } from "@/domains/contact/components/ContactForm/ContactForm.contracts";

interface CreateContactProperties {
	profile: Contracts.IProfile;
	onClose: () => void;
	onCancel: () => void;
	onSave: (contactId: string) => void;
}

export const CreateContact: React.VFC<CreateContactProperties> = ({ profile, onClose, onCancel, onSave }) => {
	const { t } = useTranslation();

	const [errors, setErrors] = useState<Partial<Record<keyof ContactFormState, string>>>({});

	const { persist } = useEnvironmentContext();

	const handleOnSave = async ({ name, addresses }: ContactFormData) => {
		const contact = profile.contacts().create(name, addresses);
		await persist();
		onSave(contact.id());
		setErrors({});
	};

	const handleChange = (fieldName: keyof ContactFormState) => {
		const { [fieldName]: _, ...restErrors } = errors;
		setErrors(restErrors);
	};

	return (
		<Modal
			isOpen
			title={t("CONTACTS.MODAL_CREATE_CONTACT.TITLE")}
			description={t("CONTACTS.MODAL_CREATE_CONTACT.DESCRIPTION")}
			onClose={onClose}
		>
			<div className="mt-8">
				<ContactForm
					profile={profile}
					onChange={handleChange}
					onCancel={onCancel}
					onSave={handleOnSave}
					errors={errors}
				/>
			</div>
		</Modal>
	);
};
