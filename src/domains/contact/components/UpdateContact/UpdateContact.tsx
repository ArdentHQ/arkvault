import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { Modal } from "@/app/components/Modal";
import { useEnvironmentContext } from "@/app/contexts";
import { ContactForm } from "@/domains/contact/components/ContactForm";
import { ContactFormData, ContactFormState } from "@/domains/contact/components/ContactForm/ContactForm.contracts";
import { useBreakpoint } from "@/app/hooks";

interface UpdateContactProperties {
	contact: Contracts.IContact;
	profile: Contracts.IProfile;
	onCancel: () => void;
	onClose: () => void;
	onDelete: () => void;
	onSave: (contactId: string) => void;
}

export const UpdateContact: React.VFC<UpdateContactProperties> = ({
	contact,
	onClose,
	onCancel,
	onDelete,
	onSave,
	profile,
}) => {
	const [errors, setErrors] = useState<Partial<Record<keyof ContactFormState, string>>>({});

	const { t } = useTranslation();
	const { isSm, isXs } = useBreakpoint();
	const { persist } = useEnvironmentContext();

	const handleSave = async ({ name, addresses }: ContactFormData) => {
		profile.contacts().update(contact.id(), { addresses, name });
		await persist();
		onSave(contact.id());
	};

	const handleChange = (fieldName: keyof ContactFormState) => {
		const { [fieldName]: _, ...restErrors } = errors;
		setErrors(restErrors);
	};

	return (
		<Modal
			isOpen
			title={t("CONTACTS.MODAL_UPDATE_CONTACT.TITLE")}
			description={isXs || isSm ? undefined : t("CONTACTS.MODAL_UPDATE_CONTACT.DESCRIPTION")}
			onClose={onClose}
		>
			<div className="mt-8">
				<ContactForm
					profile={profile}
					errors={errors}
					contact={contact}
					onCancel={onCancel}
					onDelete={onDelete}
					onChange={handleChange}
					onSave={handleSave}
				/>
			</div>
		</Modal>
	);
};
