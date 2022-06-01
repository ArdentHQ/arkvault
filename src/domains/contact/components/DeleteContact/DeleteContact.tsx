import { Contracts } from "@payvo/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";

import { DeleteResource } from "@/app/components/DeleteResource";
import { useEnvironmentContext } from "@/app/contexts";

interface DeleteContactProperties {
	contact: Contracts.IContact;
	profile: Contracts.IProfile;
	onCancel: () => void;
	onClose: () => void;
	onDelete: (contactId: string) => void;
}

export const DeleteContact: React.VFC<DeleteContactProperties> = ({
	contact,
	profile,
	onCancel,
	onClose,
	onDelete,
}) => {
	const { t } = useTranslation();

	const { persist } = useEnvironmentContext();

	const handleDelete = async () => {
		profile.contacts().forget(contact.id());
		await persist();

		onDelete(contact.id());
	};

	return (
		<DeleteResource
			isOpen
			title={t("CONTACTS.MODAL_DELETE_CONTACT.TITLE")}
			description={t("CONTACTS.MODAL_DELETE_CONTACT.DESCRIPTION")}
			onClose={onClose}
			onCancel={onCancel}
			onDelete={handleDelete}
		/>
	);
};
