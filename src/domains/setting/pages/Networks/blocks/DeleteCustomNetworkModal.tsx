import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Networks } from "@payvo/sdk";
import { FormField, FormLabel } from "@/app/components/Form";
import { Input } from "@/app/components/Input";
import { DeleteResource } from "@/app/components/DeleteResource";

const DeleteCustomNetworkModal: React.VFC<{
	onDelete: () => void;
	onCancel: () => void;
	network: Networks.NetworkManifest;
}> = ({ onDelete, onCancel, network }) => {
	const { t } = useTranslation();
	const [isValid, setIsValid] = useState(false);

	const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
		setIsValid(event.target.value === network.name);
	};

	return (
		<DeleteResource
			data-testid="NetworksSettings--delete-confirmation"
			title={t("SETTINGS.NETWORKS.DELETE_MODAL.TITLE")}
			description={t("SETTINGS.NETWORKS.DELETE_MODAL.DESCRIPTION")}
			isOpen
			onClose={onCancel}
			onCancel={onCancel}
			onDelete={onDelete}
			disabled={!isValid}
			deleteLabel={t("COMMON.REMOVE")}
		>
			<FormField name="networkName" className="mt-6">
				<FormLabel label={t("SETTINGS.NETWORKS.FORM.NETWORK_NAME")} />
				<Input
					className="mb-4"
					innerClassName="font-semibold text-center"
					value={network.name}
					readOnly
					disabled
				/>
				<Input
					data-testid="NetworksSettings--confirmName"
					onChange={changeHandler}
					placeholder={t("SETTINGS.NETWORKS.FORM.DELETE_CONFIRM_PLACEHOLDER")}
				/>
			</FormField>
		</DeleteResource>
	);
};

export default DeleteCustomNetworkModal;
