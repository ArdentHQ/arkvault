import { useWalletAlias, WalletAliasResult } from "@/app/hooks";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { useEffect, useMemo, useState } from "react";
import { isContractTransaction } from "@/domains/transaction/utils";
import { IReadWriteWallet } from "@ardenthq/sdk-profiles/distribution/esm/wallet.contract";

export const useTransactionRecipients = ({
	transaction,
	profile,
}: {
	transaction: DTO.ExtendedConfirmedTransactionData;
	profile: Contracts.IProfile;
}): { recipients: WalletAliasResult[] } => {
	const { getWalletAlias } = useWalletAlias();
	const [recipients, setRecipients] = useState<WalletAliasResult[]>([]);

	const recipientAddresses = useMemo(() => {
		if (transaction.isMultiPayment()) {
			return transaction.recipients().map((recipient) => ({
				address: recipient.address,
				network: transaction.wallet().network().id(),
				coin: transaction.wallet().network().coin(),
			}));
		}

		if (transaction.isTransfer() || isContractTransaction(transaction)) {
			return [{
				address: transaction.recipient(),
				network: transaction.wallet().network().id(),
				coin: transaction.wallet().network().coin(),
			}];
		}

		return [];
	}, [transaction]);

	useEffect(() => {
		const fetchWalletFromAddress = async ({ address, network, coin }) => {
			try {
				const wallet = await profile.walletFactory().fromAddress({
					address,
					coin,
					network,
				});

				await wallet.synchroniser().identity();
				await wallet.synchroniser().coin();

				return {
					wallet,
					...getWalletAlias({
						address,
						network: transaction.wallet().network(),
						profile,
						username: wallet.username(),
					}),
				};
			} catch {
				return {
					address,
					alias: "",
					isContact: false,
				};
			}
		};

		const fetchRecipients = async () => {
			// Set fallback recipients immediately
			const fallbackRecipients = recipientAddresses.map(({ address }) => ({
				address,
				alias: "",
				isContact: false,
			}));
			setRecipients(fallbackRecipients);

			// Fetch all wallet data in parallel
			const results = await Promise.allSettled(
				recipientAddresses.map((addressData) => fetchWalletFromAddress(addressData))
			);


			const validRecipients = results
				.filter((result): result is PromiseFulfilledResult<{wallet: IReadWriteWallet, address: string, alias: string, isContact: boolean}> => 
					result.status === "fulfilled"
				)
				.map((result) => result.value);

			setRecipients(validRecipients);
		};

		fetchRecipients();
	}, [recipientAddresses, profile, transaction, getWalletAlias]);

	return { recipients };
};
