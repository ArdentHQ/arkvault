import { Networks } from "@ardenthq/sdk";
import { isEqual } from "@ardenthq/sdk-helpers";
import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { useDebounce, useFees } from "@/app/hooks";
import { toasts } from "@/app/services";
import { InputFee } from "@/domains/transaction/components/InputFee";

interface Properties {
	type: string;
	data: Record<string, any> | undefined;
	network: Networks.Network;
	profile: Contracts.IProfile;
}

export const FeeField: React.FC<Properties> = ({ type, network, profile, ...properties }: Properties) => {
	const isMounted = useRef(true);
	const { t } = useTranslation();

	const { calculate } = useFees(profile);

	const [isLoadingFee, setIsLoadingFee] = useState(false);

	const { setError, clearErrors, watch, setValue, getValues } = useFormContext();
	const { fees, inputFeeSettings = {} } = watch(["fees", "inputFeeSettings"]);

	// getValues does not get the value of `defaultValues` on first render
	const [defaultFee] = useState(() => watch("fee"));
	const fee = getValues("fee") || defaultFee;

	const [data, isLoadingData] = useDebounce(properties.data, 700);

	const isCalculatingFee = useMemo(() => isLoadingData || isLoadingFee, [isLoadingData, isLoadingFee]);
	const usesSizeBasedFee = useMemo(() => network.feeType() === "size", [network]);
	const usesStaticFee = useMemo(() => network.feeType() !== "dynamic" || !fees?.isDynamic, [fees, network]);

	useEffect(() => {
		if (usesSizeBasedFee || type === "multiSignature") {
			if (isCalculatingFee) {
				// This message does not need i18n as it is only intended to mark
				// the form as invalid until fee calculation has been completed.
				setError("feeCalculation", { message: "fee calculation not completed" });
			} else {
				clearErrors("feeCalculation");
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isCalculatingFee, setError, clearErrors, usesSizeBasedFee]);

	const resetFees = useCallback(() => {
		setValue("fees", { avg: 0, max: 0, min: 0, static: 0 });
	}, [setValue]);

	const hasResetBasedFees = useCallback(() => {
		if (!usesSizeBasedFee) {
			return false;
		}

		if (data === undefined) {
			resetFees();
			return true;
		}

		if (type === "transfer" && (!data.amount || !data.to)) {
			resetFees();
			return true;
		}

		if (type === "multiPayment" && !data.payments?.length) {
			resetFees();
			return true;
		}

		if (type === "vote" && !data.votes?.length && !data.unvotes?.length) {
			resetFees();
			return true;
		}

		if (type === "validatorRegistration" && !data.validatorPublicKey) {
			resetFees();
			return true;
		}

		return false;
	}, [data, resetFees, type, usesSizeBasedFee]);

	const showFeeChangedToast = useCallback(() => {
		toasts.warning(t("TRANSACTION.PAGE_TRANSACTION_SEND.FORM_STEP.FEE_UPDATE"));
	}, [t]);

	const setNewFees = useCallback(
		(transactionFees) => {
			if (isEqual(getValues("fees"), transactionFees)) {
				return;
			}

			/* istanbul ignore else -- @preserve */
			if (
				network.feeType() === "static" ||
				transactionFees.isDynamic === false ||
				getValues("fee") === undefined
			) {
				const newFee = transactionFees.isDynamic ? transactionFees.avg : transactionFees.static;

				if (getValues("fee") !== undefined) {
					showFeeChangedToast();
				}

				setValue("fee", newFee, { shouldDirty: true, shouldValidate: true });
			}

			if (usesSizeBasedFee && +getValues("fee") < +transactionFees.min) {
				setValue("fee", transactionFees.min, { shouldDirty: true, shouldValidate: true });

				showFeeChangedToast();
			}

			setValue("fees", transactionFees, { shouldDirty: true, shouldValidate: true });
		},
		[getValues, network, setValue, showFeeChangedToast, usesSizeBasedFee],
	);

	useEffect(() => {
		const recalculateFee = async () => {
			// Set fees to 0 when fee type is "size" but current form data
			// is not sufficient yet to calculate the transaction fees.
			if (hasResetBasedFees()) {
				return;
			}

			setIsLoadingFee(true);

			const transactionFees = await calculate({
				coin: network.coin(),
				data,
				network: network.id(),
				type,
			});

			setNewFees(transactionFees);

			/* istanbul ignore next -- @preserve */
			if (isMounted.current) {
				setIsLoadingFee(false);
			}
		};

		void recalculateFee();
	}, [
		calculate,
		data,
		getValues,
		isMounted,
		network,
		setValue,
		type,
		usesSizeBasedFee,
		hasResetBasedFees,
		setNewFees,
	]);

	useEffect(
		/* istanbul ignore next -- @preserve */
		() => () => {
			isMounted.current = false;
		},
		[],
	);

	return (
		<InputFee
			min={fees?.min}
			avg={fees?.avg}
			max={fees?.max}
			loading={!fees || isLoadingFee}
			value={fee}
			step={0.01}
			disabled={usesStaticFee && !usesSizeBasedFee}
			network={network}
			profile={profile}
			onChange={(value) => {
				setValue("fee", value, { shouldDirty: true, shouldValidate: true });
			}}
			viewType={inputFeeSettings.viewType}
			onChangeViewType={(viewType) => {
				setValue(
					"inputFeeSettings",
					{ ...inputFeeSettings, viewType },
					{ shouldDirty: true, shouldValidate: true },
				);
			}}
			simpleValue={inputFeeSettings.simpleValue}
			onChangeSimpleValue={(simpleValue) => {
				setValue(
					"inputFeeSettings",
					{ ...inputFeeSettings, simpleValue },
					{ shouldDirty: true, shouldValidate: true },
				);
			}}
		/>
	);
};
