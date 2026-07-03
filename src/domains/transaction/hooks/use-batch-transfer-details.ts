import { Contracts } from "@/app/lib/profiles";
import { useExchangeRate } from "@/app/hooks/use-exchange-rate";
import { WalletToken } from "@/app/lib/profiles/wallet-token";
import { BigNumber } from "@/app/lib/helpers";
import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";

interface TransferDetailsProperties {
	profile: Contracts.IProfile;
	wallet: Contracts.IReadWriteWallet;
	recipients: RecipientItem[];
	tokenContractAddress: string;
}

export const calculateTotalAmount = (recipients: { amount?: number | string }[]) => {
	let amount = BigNumber.make(0);

	for (const recipient of recipients) {
		amount = amount.plus(BigNumber.make(recipient.amount ?? 0));
	}

	return amount;
};

export const useBatchTransferDetails = ({
	profile,
	wallet,
	recipients,
	tokenContractAddress,
}: TransferDetailsProperties) => {
	const amount = calculateTotalAmount(recipients);

	const walletToken = wallet
		.tokens()
		.values()
		.find((token) => token.token().address() === tokenContractAddress) as WalletToken;

	const ticker = walletToken.token().displaySymbol();
	const exchangeTicker = profile.settings().get<string>(Contracts.ProfileSetting.ExchangeCurrency) as string;
	const { convert } = useExchangeRate({ exchangeTicker, profile, ticker });

	const convertedAmount = wallet.network().isTest() ? 0 : convert(amount.toFixed());

	return {
		amount,
		convertedAmount,
		exchangeTicker,
		walletToken,
	};
};
