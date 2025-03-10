import { useWalletAlias, WalletAliasResult } from "@/app/hooks";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { useMemo } from "react";
import { isContractTransaction } from "@/domains/transaction/utils";
import { useActiveNetwork } from "@/app/hooks/use-active-network";

export const useTransactionRecipients = ({
	transaction,
	profile,
}: {
	transaction: DTO.ExtendedConfirmedTransactionData;
	profile: Contracts.IProfile;
}): { recipients: WalletAliasResult[] } => {
	const { getWalletAlias } = useWalletAlias();
	const { activeNetwork } = useActiveNetwork({ profile });

	const recipients = useMemo(() => {
		if (transaction.isMultiPayment()) {
			return transaction.recipients().map((recipient) =>
				getWalletAlias({
					address: recipient.address,
					network: activeNetwork,
					profile,
				}),
			);
		}

		if (transaction.isTransfer()) {
			return [
				getWalletAlias({
					address: transaction.recipient(),
					network: activeNetwork,
					profile,
				}),
			];
		}

		return [];
	}, [transaction]);

	return { recipients };
};
