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
				coin: transaction.wallet().network().coin(),
				network: transaction.wallet().network().id(),
			}));
		}

		if (transaction.isTransfer() || isContractTransaction(transaction)) {
			return [
				{
					address: transaction.recipient(),
					coin: transaction.wallet().network().coin(),
					network: transaction.wallet().network().id(),
				},
			];
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

				// As this is to ensure the username is fetched, cache wallet data (including username)
				// to avoid multiple unecessary network requests (e.g transactions table or transaction detail overview modal).
				await wallet.synchroniser().identity({ ttl: 10_000 });

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
				recipientAddresses.map((addressData) => fetchWalletFromAddress(addressData)),
			);

			const validRecipients = results
				.filter(
					(
						result,
					): result is PromiseFulfilledResult<{
						wallet: IReadWriteWallet;
						address: string;
						alias: string;
						isContact: boolean;
					}> => result.status === "fulfilled",
				)
				.map((result) => result.value);

			setRecipients(validRecipients);
		};

		fetchRecipients();
	}, [recipientAddresses, profile, transaction, getWalletAlias]);

	return { recipients };
};
