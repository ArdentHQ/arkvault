import { Contracts as ProfileContracts } from "@/app/lib/profiles";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useEnvironmentContext } from "@/app/contexts";
import { useActiveProfile } from "@/app/hooks";
import { TransactionFees } from "@/types";
import { BigNumber } from "@/app/lib/helpers";

type CallbackFunction = () => void;

enum FeeWarningVariant {
	Low = "LOW",
	High = "HIGH",
}

export const useFeeConfirmation = (fee: number | string, fees: TransactionFees) => {
	const [showFeeWarning, setShowFeeWarning] = useState(false);
	const [feeWarningVariant, setFeeWarningVariant] = useState<FeeWarningVariant | undefined>();

	const activeProfile = useActiveProfile();
	const { persist } = useEnvironmentContext();

	useEffect(() => {
		if (!fee) {
			return;
		}

		if (BigNumber.make(fee).isLessThan(fees.min)) {
			setFeeWarningVariant(FeeWarningVariant.Low);
		}

		if (BigNumber.make(fee).isGreaterThanOrEqualTo(fees.min)) {
			setFeeWarningVariant(undefined);
		}
	}, [fee, fees]);

	const dismissFeeWarning = useCallback(
		async (callback: CallbackFunction, suppressWarning: boolean) => {
			setShowFeeWarning(false);

			if (suppressWarning) {
				activeProfile.settings().set(ProfileContracts.ProfileSetting.DoNotShowFeeWarning, true);

				await persist();
			}

			const result: any = callback();

			if (result instanceof Promise) {
				await result;
			}
		},
		[activeProfile, persist],
	);

	const requireFeeConfirmation = useMemo(
		() =>
			feeWarningVariant !== undefined &&
			!activeProfile.settings().get(ProfileContracts.ProfileSetting.DoNotShowFeeWarning),
		[activeProfile, feeWarningVariant],
	);

	return {
		dismissFeeWarning,
		feeWarningVariant,
		requireFeeConfirmation,
		setShowFeeWarning,
		showFeeWarning,
	};
};
