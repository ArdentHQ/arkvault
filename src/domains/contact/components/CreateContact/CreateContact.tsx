import { Contracts } from "@/app/lib/profiles";
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

export const CreateContact = ({ profile, onClose, onCancel, onSave }: CreateContactProperties) => {
	const { t } = useTranslation();

	const [errors, setErrors] = useState<Partial<Record<keyof ContactFormState, string>>>({});

	const { persist } = useEnvironmentContext();

	const handleOnSave = async ({ name, address }: ContactFormData) => {
		const contact = profile.contacts().create(name, [address]);
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
			size="3xl"
			title={t("CONTACTS.MODAL_CREATE_CONTACT.TITLE")}
			description={t("CONTACTS.MODAL_CREATE_CONTACT.DESCRIPTION")}
			onClose={onClose}
			titleClass="leading-[21px]! sm:leading-[29px]!"
		>
			<div className="mt-4">
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
