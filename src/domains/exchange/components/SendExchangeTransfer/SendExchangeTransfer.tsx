import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { Modal } from "@/app/components/Modal";

interface TransferProperties {
	// profile: Contracts.IProfile;
	onCancel: () => void;
	// onSave: (contactId: string) => void;
	isOpen: boolean;
}

export const SendExchangeTransfer: React.VFC<TransferProperties> = ({
	onClose,
	onCancel,
	onSave,
	profile,
	isOpen
}) => {
	const { t } = useTranslation();

	return (
		<Modal
			isOpen={isOpen}
			onClose={onCancel}
			title={"Sign Exchange Transaction"}
		>
			modal
		</Modal>
	);
};
