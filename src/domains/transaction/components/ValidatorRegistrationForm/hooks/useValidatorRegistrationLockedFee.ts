import { BigNumber } from "@/app/lib/helpers";
import { UnitConverter } from "@arkecosystem/typescript-crypto";
import { configManager } from "@/app/lib/mainsail";
import { Contracts } from "@/app/lib/profiles";
import { useExchangeRate } from "@/app/hooks/use-exchange-rate";

export const useValidatorRegistrationLockedFee = ({
	wallet,
	profile,
}: {
	wallet?: Contracts.IReadWriteWallet;
	profile: Contracts.IProfile;
}): {
	validatorRegistrationFee: number;
	validatorRegistrationFeeAsFiat: number | null;
	validatorRegistrationFeeTicker: string;
	validatorRegistrationFeeAsFiatTicker: string;
} => {
	const isTestnet = wallet?.network().isTest() === true;

	const validatorRegistrationFee = BigNumber.make(
		UnitConverter.formatUnits(
			BigNumber.make(configManager.getMilestone()["validatorRegistrationFee"] ?? 0).toString(),
			"ARK",
		),
	).toNumber();

	const ticker = wallet?.currency();
	const exchangeTicker = profile.settings().get<string>(Contracts.ProfileSetting.ExchangeCurrency) as string;
	const { convert } = useExchangeRate({ exchangeTicker, profile, ticker });

	const validatorRegistrationFeeAsFiat = isTestnet ? null : convert(validatorRegistrationFee);

	return {
		validatorRegistrationFee,
		validatorRegistrationFeeAsFiat,
		validatorRegistrationFeeAsFiatTicker: exchangeTicker,
		validatorRegistrationFeeTicker: ticker ?? "ARK",
	};
};
