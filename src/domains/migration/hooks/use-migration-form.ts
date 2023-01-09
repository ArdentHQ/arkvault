import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";

export interface MigrationForm {
	fee: number;
	amount: number;
	migrationAddress: string;
	mnemonic: string;
	secondMnemonic: string;
	memo: string;
	encryptionPassword: string;
	wif: string;
	privateKey: string;
	secret: string;
	secondSecret: string;
	recipients: RecipientItem[];
}

const TRANSACTION_FEE = Number.parseFloat(import.meta.env.VITE_POLYGON_MIGRATION_TRANSACTION_FEE || 0.05);

export const useMigrationForm = () => {
	const form = useForm<MigrationForm>({
		defaultValues: {
			fee: TRANSACTION_FEE,
			// TODO: remove hardcoded address.
			migrationAddress: "0x080de88aE69Bc02eB8csr34E863B7F428699bb20",
			recipients: [
				{
					amount: 1,
					address: "DNBURNBURNBURNBRNBURNBURNBURKz8StY",
				},
			],
		},
		mode: "onChange",
		shouldUnregister: false,
	});

	useEffect(() => {
		form.register("fee");
	}, []);

	return form;
};
