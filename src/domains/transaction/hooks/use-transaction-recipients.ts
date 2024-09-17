import { useWalletAlias, WalletAliasResult } from "@/app/hooks";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { useMemo } from "react";

export const useTransactionRecipients = ({
	transaction,
	profile,
}: {
	transaction: DTO.ExtendedConfirmedTransactionData;
	profile: Contracts.IProfile;
}) => {
	const { getWalletAlias } = useWalletAlias()

	const recipients: WalletAliasResult[] = useMemo(() => {
		const recipients: WalletAliasResult[] = [];

		if (transaction.isTransfer()) {
			recipients.push(
				getWalletAlias({
					address: transaction.recipient(),
					network: transaction.wallet().network(),
					profile,
				}),
			);
		}

		if (transaction.isMultiPayment()) {
			for (const recipient of transaction.recipients()) {
				recipients.push(
					getWalletAlias({
						address: recipient.address,
						network: transaction.wallet().network(),
						profile,
					}),
				);
			}
		}

		return recipients;
	}, [getWalletAlias, profile, transaction]);

	return {
		recipients
	}
}
