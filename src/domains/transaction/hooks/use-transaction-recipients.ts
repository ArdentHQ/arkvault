import { useWalletAlias, WalletAliasResult } from "@/app/hooks";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { useEffect, useMemo, useState } from "react";
import { isContractTransaction } from "@/domains/transaction/utils";

type TransactionProps = {
	transaction: DTO.ExtendedConfirmedTransactionData;
	profile: Contracts.IProfile;
	senderAlias?: WalletAliasResult;
};

const createRecipientRequest = (
	address: string,
	transaction: DTO.ExtendedConfirmedTransactionData,
	profile: Contracts.IProfile,
) => ({
	address,
	network: transaction.wallet().network(),
	profile,
	username: transaction.wallet().username(),
});

const createInitialRecipient = (address: string): WalletAliasResult => ({
	address,
	alias: "",
	isContact: false,
});

export const useTransactionRecipients = ({ transaction, profile, senderAlias }: TransactionProps) => {
	const { getWalletAlias } = useWalletAlias();
	const [recipients, setRecipients] = useState<WalletAliasResult[]>([]);

	const aliasRequests = useMemo(() => {
		const requests: Parameters<typeof getWalletAlias>[0][] = [];
		
		const addRecipientRequest = (address: string) => {
			if (!senderAlias || senderAlias.address !== address) {
				requests.push(createRecipientRequest(address, transaction, profile));
			}
		};

		if (transaction.isTransfer() || isContractTransaction(transaction)) {
			addRecipientRequest(transaction.recipient());
		} else if (transaction.isMultiPayment()) {
			transaction.recipients().forEach(({ address }) => addRecipientRequest(address));
		}

		return requests;
	}, [transaction, profile, senderAlias]);

	const initializeRecipients = () => {
		const initialRecipients: WalletAliasResult[] = [];

		const addRecipient = (address: string) => {
			if (senderAlias?.address === address) {
				initialRecipients.push(senderAlias);
			} else {
				initialRecipients.push(createInitialRecipient(address));
			}
		};

		if (transaction.isTransfer() || isContractTransaction(transaction)) {
			addRecipient(transaction.recipient());
		} else if (transaction.isMultiPayment()) {
			transaction.recipients().forEach(({ address }) => addRecipient(address));
		}

		setRecipients(initialRecipients);
	};

	useEffect(() => {
		initializeRecipients();

		const fetchRecipients = async () => {
			if (transaction.isTransfer() || isContractTransaction(transaction)) {
				const wallet = await profile.walletFactory().fromAddress({
					address: transaction.recipient(),
					coin: transaction.wallet().network().coin(),
					network: transaction.wallet().network().id(),
				});
				await wallet.synchroniser().identity();
				await wallet.synchroniser().coin();
			}

			const results = await Promise.all(aliasRequests.map((request) => getWalletAlias(request)));
			const finalRecipients: WalletAliasResult[] = [];
			
			const addFinalRecipient = (address: string, index: number) => {
				if (senderAlias?.address === address) {
					finalRecipients.push(senderAlias);
				} else {
					finalRecipients.push(results[index]);
				}
			};

			if (transaction.isTransfer() || isContractTransaction(transaction)) {
				addFinalRecipient(transaction.recipient(), 0);
			} else if (transaction.isMultiPayment()) {
				let resultIndex = 0;
				transaction.recipients().forEach(({ address }) => {
					addFinalRecipient(address, resultIndex);
					if (!senderAlias || senderAlias.address !== address) {
						resultIndex++;
					}
				});
			}
			
			setRecipients(finalRecipients);
		};

		fetchRecipients();
	}, [aliasRequests, transaction, profile, getWalletAlias, senderAlias]);

	return { recipients };
};
