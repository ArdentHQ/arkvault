import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Contracts } from "@ardenthq/sdk-profiles";
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
	wallet: Contracts.IReadWriteWallet;
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
					address: "DNBURNBURNBURNBRNBURNBURNBURKz8StY",
					amount: 1,
				},
			],
		},
		mode: "onChange",
		shouldUnregister: false,
	});

	const { register } = form;

	useEffect(() => {
		register("fee");
		register("migrationAddress", { required: true });
		register("wallet", { required: true });
	}, [register]);

	return form;
};
