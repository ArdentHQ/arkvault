import { useRef, useState } from "react";
import { UseFormMethods } from "react-hook-form";

import { Contracts } from "@ardenthq/sdk-profiles";
import { Services } from "@ardenthq/sdk";

import { buildTransferData } from "@/domains/transaction/pages/SendTransfer/SendTransfer.helpers";
import { useTransactionBuilder } from "@/domains/transaction/hooks";
import { handleBroadcastError } from "@/domains/transaction/utils";
import { useLedgerContext } from "@/app/contexts";
import { MigrationForm } from "@/domains/migration/hooks/use-migration-form";

export const useMigrationTransaction = ({
	context,
	profile,
}: {
	context: UseFormMethods<MigrationForm>;
	profile: Contracts.IProfile;
}) => {
	const [isSending, setIsSending] = useState(false);
	const abortReference = useRef(new AbortController());

	const { watch } = context;

	const transactionBuilder = useTransactionBuilder();
	const { connect } = useLedgerContext();

	const {
		fee,
		encryptionPassword,
		mnemonic,
		privateKey,
		secondMnemonic,
		secondSecret,
		secret,
		wif,
		recipients,
		wallet,
		// migrationAddress,
	} = watch();

	const signTransaction = async () => {
		const signatory = await wallet.signatoryFactory().make({
			encryptionPassword,
			mnemonic,
			privateKey,
			secondMnemonic,
			secondSecret,
			secret,
			wif,
		});

		const transactionInput: Services.TransactionInputs = {
			data: await buildTransferData({
				coin: wallet.coin(),
				isMultiSignature: signatory.actsWithMultiSignature() || signatory.hasMultiSignature(),
				recipients,
				// memo: migrationAddress,
				memo: "0x0000000000000000000000000000000000000000",
			}),
			fee: +fee,
			signatory,
		};

		const { uuid, transaction } = await transactionBuilder.build("transfer", transactionInput, wallet, {
			abortSignal: abortReference.current.signal,
		});

		return { transaction, uuid };
	};

	const sendTransaction = async () => {
		setIsSending(true);

		if (wallet.isLedger()) {
			await connect(profile, wallet.coinId(), wallet.networkId());
		}

		const { uuid, transaction } = await signTransaction();
		const response = await wallet.transaction().broadcast(uuid);

		handleBroadcastError(response);

		setIsSending(false);
		return transaction;
	};

	return { abortTransaction: () => abortReference.current.abort(), isSending, sendTransaction };
};
