import { Services, Signatories } from "@ardenthq/sdk";
import { Contracts as ProfileContracts } from "@ardenthq/sdk-profiles";
import { useRef } from "react";

import { useLedgerContext } from "@/app/contexts";
import { Participant } from "@/domains/transaction/components/MultiSignatureRegistrationForm/components/AddParticipant/AddParticipant";
import { ExtendedSignedTransactionData } from "@/domains/transaction/pages/SendRegistration/SendRegistration.contracts";
import { handleBroadcastError, withAbortPromise } from "@/domains/transaction/utils";
import { assertString } from "@/utils/assertions";

interface SendMultisignatureProperties {
	wallet: ProfileContracts.IReadWriteWallet;
	participants: Participant[];
	minParticipants: number;
	fee: Services.TransactionFee;
	signatory: Signatories.Signatory;
}

interface AddSignatureProperties {
	transactionId: string;
	signatory: Signatories.Signatory;
	wallet: ProfileContracts.IReadWriteWallet;
}

const getPublicKey = (wallet: ProfileContracts.IReadWriteWallet) => {
	if (wallet.isLedger()) {
		const derivationPath = wallet.data().get(ProfileContracts.WalletData.DerivationPath);
		assertString(derivationPath);

		return wallet.ledger().getPublicKey(derivationPath);
	}

	return wallet.publicKey();
};

const sendMultiSignature = async ({
	wallet,
	participants,
	minParticipants,
	fee,
	signatory,
}: SendMultisignatureProperties) => {
	// TODO: Handle ledger wallets of other participants without public keys (use derivation path)
	const restPublicKeys = participants
		.filter((participant) => participant.address !== wallet.address())
		.map((participant) => participant.publicKey);

	const senderPublicKey = await getPublicKey(wallet);
	assertString(senderPublicKey);

	const publicKeys = [senderPublicKey, ...restPublicKeys];
	await wallet.transaction().sync();

	const transaction: ExtendedSignedTransactionData = wallet.transaction().transaction(
		await wallet.transaction().signMultiSignature({
			data: {
				mandatoryKeys: publicKeys,
				min: +minParticipants,
				numberOfSignatures: +minParticipants,
				optionalKeys: [],
				publicKeys,
				senderPublicKey,
			},
			fee: +fee,
			signatory,
		}),
	);

	await wallet.transaction().broadcast(transaction.id());

	try {
		const { address } = await wallet
			.coin()
			.address()
			.fromMultiSignature({ min: minParticipants, publicKeys, senderPublicKey });

		transaction.generatedAddress = address;

		wallet.profile().pendingMusigWallets().add(address, wallet.coinId(), wallet.networkId());
	} catch {
		// We are using a coin that doesn't support multi-signature address derivation.
	}

	return transaction;
};

const broadcast = async ({
	wallet,
	transactionId,
}: {
	wallet: ProfileContracts.IReadWriteWallet;
	transactionId: string;
}) => {
	if (!wallet.transaction().canBeBroadcasted(transactionId)) {
		throw new Error("Transaction cannot be broadcasted");
	}

	await wallet.transaction().sync();

	const response = await wallet.transaction().broadcast(transactionId);
	handleBroadcastError(response);

	await wallet.transaction().sync();

	return wallet.transaction().transaction(response.accepted[0]);
};

export const useMultiSignatureRegistration = () => {
	const { abortConnectionRetry } = useLedgerContext();
	const abortReference = useRef(new AbortController());

	const signWithLedger = async (wallet: ProfileContracts.IReadWriteWallet) => {
		const prepareLedger = () =>
			wallet.signatory().ledger(wallet.data().get<string>(ProfileContracts.WalletData.DerivationPath)!);

		return withAbortPromise(abortReference.current.signal, abortConnectionRetry)(prepareLedger());
	};

	const addSignature = async ({ transactionId, signatory, wallet }: AddSignatureProperties) => {
		await wallet.transaction().sync();

		if (wallet.isLedger()) {
			const ledgerSignatory = await signWithLedger(wallet);
			return wallet.transaction().addSignature(transactionId, ledgerSignatory);
		}

		return wallet.transaction().addSignature(transactionId, signatory);
	};

	return { abortReference, addSignature, broadcast, sendMultiSignature };
};
