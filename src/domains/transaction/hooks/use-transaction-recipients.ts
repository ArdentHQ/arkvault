import { useWalletAlias, WalletAliasResult } from "@/app/hooks";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { useEffect, useMemo } from "react";
import { isContractTransaction } from "@/domains/transaction/utils";
import { IReadWriteWallet } from "@ardenthq/sdk-profiles/distribution/esm/wallet.contract";
import { useActiveNetwork } from "@/app/hooks/use-active-network";

export const useTransactionRecipients = ({
	transaction,
	profile,
}: {
	transaction: DTO.ExtendedConfirmedTransactionData;
	profile: Contracts.IProfile;
}): { recipients: WalletAliasResult[] } => {
	const { getWalletAlias } = useWalletAlias();
	const { activeNetwork } = useActiveNetwork({ profile })

	const recipients = useMemo(() => {
		if (transaction.isMultiPayment()) {
			return transaction.recipients().map(recipient => getWalletAlias({
				address: recipient.address,
				network: activeNetwork,
				profile,
			}))
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

	return { recipients };
};
