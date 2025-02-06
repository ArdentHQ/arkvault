import { useWalletAlias, WalletAliasResult } from "@/app/hooks";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { useEffect, useMemo, useState } from "react";
import { isContractTransaction } from "@/domains/transaction/utils";

export const useTransactionRecipients = ({
	transaction,
	profile,
}: {
	transaction: DTO.ExtendedConfirmedTransactionData;
	profile: Contracts.IProfile;
}): { recipients: WalletAliasResult[] } => {
	const { getWalletAlias } = useWalletAlias();
	const [recipients, setRecipients] = useState<WalletAliasResult[]>([]);

	const aliasRequests = useMemo(() => {
		const requests: Parameters<typeof getWalletAlias>[0][] = [];
		if (transaction.isTransfer() || isContractTransaction(transaction)) {
			requests.push({
				address: transaction.recipient(),
				network: transaction.wallet().network(),
				profile,
			});
		}
		if (transaction.isMultiPayment()) {
			for (const recipient of transaction.recipients()) {
				requests.push({
					address: recipient.address,
					network: transaction.wallet().network(),
					profile,
				});
			}
		}
		return requests;
	}, [transaction, profile, getWalletAlias]);

	useEffect(() => {
		const fallbackRecipients: WalletAliasResult[] = aliasRequests.map((request) => ({
			address: request.address,
			alias: "",
			isContact: false,
		}));
		setRecipients(fallbackRecipients);

		const fetchRecipients = async () => {
			if (transaction.isTransfer() || isContractTransaction(transaction)) {
				const wallet = await profile.walletFactory().fromAddress({
					address: transaction.recipient(),
					coin: transaction.wallet().network().coin(),
					network: transaction.wallet().network().id(),
				});
				await wallet.synchroniser().identity();
				await wallet.synchroniser().coin();

				const request = aliasRequests[0];
				request.username = wallet.username();
			}

			const results = aliasRequests.map((request) => getWalletAlias(request));
			setRecipients(results);
		};

		fetchRecipients();
	}, [aliasRequests, transaction, profile, getWalletAlias]);

	return { recipients };
};
