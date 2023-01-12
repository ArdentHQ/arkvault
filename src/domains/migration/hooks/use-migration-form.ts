import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";
import { migrationTransactionFee } from "@/utils/polygon-migration";

export interface MigrationForm {
	fee: number;
	amount: number;
	polygonAddress: string;
	senderAddress: string;
	mnemonic: string;
	secondMnemonic: string;
	memo: string;
	encryptionPassword: string;
	wif: string;
	privateKey: string;
	secret: string;
	secondSecret: string;
	recipients: RecipientItem[];
	broadcastError?: Error;
}

export const useMigrationForm = () => {
	const form = useForm<MigrationForm>({
		defaultValues: {
			fee: migrationTransactionFee(),
			// TODO: remove hardcoded address.
			polygonAddress: undefined,
			senderAddress: undefined,
			recipients: [],
			broadcastError: undefined,
		},
		mode: "onChange",
		shouldUnregister: false,
	});

	useEffect(() => {
		form.register("fee");
		form.register("polygonAddress");
		form.register("senderAddress");
	}, []);

	return form;
};
