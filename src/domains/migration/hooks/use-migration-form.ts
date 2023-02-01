import { useLayoutEffect } from "react";
import { useForm } from "react-hook-form";

import { Contracts } from "@ardenthq/sdk-profiles";
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
	wallet: Contracts.IReadWriteWallet;
}

export const useMigrationForm = () => {
	const form = useForm<MigrationForm>({
		defaultValues: {
			fee: migrationTransactionFee(),
		},
		mode: "onChange",
	});

	const { register } = form;

	useLayoutEffect(() => {
		register("fee");
		register("migrationAddress", { required: true });
		register("wallet", { required: true });
		register("recipients", { required: true });
	}, [register]);

	return form;
};
