import React from "react";
import { useTranslation } from "react-i18next";
import { Contracts } from "@ardenthq/sdk-profiles";
import { DeleteResource } from "@/app/components/DeleteResource";
import { FormField, FormLabel } from "@/app/components/Form";
import { SelectAddress } from "@/domains/profile/components/SelectAddress";
interface DeleteWalletProperties {
	onClose?: any;
	onCancel?: any;
	onDelete: any;
	wallet: Contracts.IReadWriteWallet;
}

export const DeleteWallet = ({ onClose, onCancel, onDelete, wallet }: DeleteWalletProperties) => {
	const { t } = useTranslation();

	return (
		<DeleteResource
			title={t("WALLETS.MODAL_DELETE_WALLET.TITLE")}
			description={t("WALLETS.MODAL_DELETE_WALLET.DESCRIPTION")}
			isOpen
			onClose={onClose}
			onCancel={onCancel}
			onDelete={onDelete}
		>
			<FormField name="wallet" className="mt-4">
				<FormLabel label={t("COMMON.WALLET")} className="hover:!text-theme-secondary-text" />
				<SelectAddress
					wallet={{
						address: wallet.address(),
						network: wallet.network(),
					}}
					wallets={[]}
					showUserIcon={false}
					profile={wallet.profile()}
					disabled={true}
				/>
			</FormField>
		</DeleteResource>
	);
};
