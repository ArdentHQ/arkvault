import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";
import { migrationTransactionFee } from "@/utils/polygon-migration";

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

export const useMigrationForm = () => {
	const form = useForm<MigrationForm>({
		defaultValues: {
			fee: migrationTransactionFee(),
			// TODO: remove hardcoded address.
			migrationAddress: "0x080de88aE69Bc02eB8csr34E863B7F428699bb20",
			recipients: [
				{
					address: "DNBURNBURNBURNBRNBURNBURNBURKz8StY",
					amount: 1,
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
