import { Networks } from "@ardenthq/sdk";
import { isEqual } from "@ardenthq/sdk-helpers";
import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useCallback, useEffect, useRef, useState } from "react";
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

	const { watch, setValue, getValues } = useFormContext();
	const { fees, inputFeeSettings = {} } = watch(["fees", "inputFeeSettings"]);

	const gasPrice = getValues("gasPrice") as string;
	const gasLimit = getValues("gasLimit") as number;

	console.log({gasLimit, gasPrice})

	const [data, _isLoadingData] = useDebounce(properties.data, 700);

	const showFeeChangedToast = useCallback(() => {
		toasts.warning(t("TRANSACTION.PAGE_TRANSACTION_SEND.FORM_STEP.FEE_UPDATE"));
	}, [t]);

	const setNewFees = useCallback(
		(transactionFees) => {
			if (isEqual(getValues("fees"), transactionFees)) {
				return;
			}

			/* istanbul ignore else -- @preserve */
			if (getValues("gasPrice") === undefined) {
				const newFee = transactionFees.isDynamic ? transactionFees.avg : transactionFees.static;

				if (getValues("gasPrice") !== undefined) {
					showFeeChangedToast();
				}

				setValue("gasPrice", newFee, { shouldDirty: true, shouldValidate: true });
			}

			setValue("fees", transactionFees, { shouldDirty: true, shouldValidate: true });
		},
		[getValues, setValue, showFeeChangedToast],
	);

	useEffect(() => {
		const recalculateFee = async () => {

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
			gasPrice={gasPrice}
			gasLimit={gasLimit}
			step={10}
			network={network}
			profile={profile}
			onChangeGasPrice={(value) => {
				setValue("gasPrice", value, { shouldDirty: true, shouldValidate: true });
			}}
			onChangeGasLimit={(value) => {
				setValue("gasLimit", value, { shouldDirty: true, shouldValidate: true });
			}}
			viewType={inputFeeSettings.viewType}
			onChangeViewType={(viewType) => {
				setValue(
					"inputFeeSettings",
					{ ...inputFeeSettings, viewType },
					{ shouldDirty: true, shouldValidate: true },
				);
			}}
			selectedFeeOption={inputFeeSettings.selectedFeeOption}
			onChangeFeeOption={(option) => {
				setValue(
					"inputFeeSettings",
					{ ...inputFeeSettings, selectedFeeOption: option},
					{ shouldDirty: true, shouldValidate: true },
				);
			}}
		/>
	);
};
