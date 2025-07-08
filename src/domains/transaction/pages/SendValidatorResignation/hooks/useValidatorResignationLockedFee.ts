import { BigNumber } from "@/app/lib/helpers";
import { UnitConverter } from "@arkecosystem/typescript-crypto";
import { Contracts } from "@/app/lib/profiles";
import { useExchangeRate } from "@/app/hooks/use-exchange-rate";

export const useValidatorResignationLockedFee = ({
	wallet,
	profile,
}: {
	wallet?: Contracts.IReadWriteWallet;
	profile: Contracts.IProfile;
}): {
	validatoResigationFee: number;
	validatoResigationFeeAsFiat: number | null;
	validatoResigationFeeTicker: string;
	validatoResigationFeeAsFiatTicker: string;
} => {
	const isTestnet = wallet?.network().isTest() === true;

	const validatoResigationFee = BigNumber.make(
		UnitConverter.formatUnits(BigNumber.make(wallet?.validatorFee() ?? 0).toString(), "ARK"),
	).toNumber();

	const ticker = wallet?.currency();
	const exchangeTicker = profile.settings().get<string>(Contracts.ProfileSetting.ExchangeCurrency) as string;
	const { convert } = useExchangeRate({ exchangeTicker, profile, ticker });

	const validatoResigationFeeAsFiat = isTestnet ? null : convert(validatoResigationFee);

	return {
		validatoResigationFee: 0,
		validatoResigationFeeAsFiat,
		validatoResigationFeeAsFiatTicker: exchangeTicker,
		validatoResigationFeeTicker: ticker ?? "ARK",
	};
};
