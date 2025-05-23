import { Networks } from "@/app/lib/mainsail";
import { Contracts } from "@/app/lib/profiles";
import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

import { useDebounce, useFees } from "@/app/hooks";
import { InputFee } from "@/domains/transaction/components/InputFee";

interface Properties {
	type:
		| "transfer"
		| "multiPayment"
		| "vote"
		| "validatorRegistration"
		| "validatorResignation"
		| "multiSignature"
		| "usernameRegistration"
		| "usernameResignation";
	data: Record<string, any> | undefined;
	network: Networks.Network;
	profile: Contracts.IProfile;
}

export const GasLimit: Record<Properties["type"], number> = {
	multiPayment: 21_000,
	multiSignature: 21_000,
	transfer: 21_000,
	usernameRegistration: 21_000,
	usernameResignation: 21_000,
	validatorRegistration: 21_000,
	validatorResignation: 21_000,
	vote: 21_000,
};

export const MIN_GAS_PRICE = 5;

export const FeeField: React.FC<Properties> = ({ type, network, profile, ...properties }: Properties) => {
	const { calculate, estimateGas } = useFees(profile);

	const [isLoadingFee, setIsLoadingFee] = useState(false);

	const { watch, setValue, getValues } = useFormContext();
	const { fees, inputFeeSettings = {} } = watch(["fees", "inputFeeSettings"]);

	const gasPrice = getValues("gasPrice") as number;
	const gasLimit = getValues("gasLimit") as number;
	console.log(gasPrice, gasLimit);

	const [data, _isLoadingData] = useDebounce(properties.data, 700);

	useEffect(() => {
		console.log("updating gas limit");
		/* istanbul ignore else -- @preserve */
		const isMultiPayment = type === "multiPayment";
		const recipientsCount = isMultiPayment && Array.isArray(data?.payments) ? data.payments.length : 1;
		const defaultGasLimit = isMultiPayment ? GasLimit.multiPayment * recipientsCount : GasLimit[type];

		const estimate = async () => {
			let gasLimit = defaultGasLimit;

			try {
				gasLimit = await estimateGas({ data: { ...getValues(), ...data }, type });
			} catch (error) {
				console.warn(error);
			}

			console.log("updated gas limit", gasLimit);
			setValue("gasLimit", gasLimit, { shouldDirty: true, shouldValidate: true });
		};

		void estimate();
	}, [estimateGas, getValues, setValue, type]);

	useEffect(() => {
		const recalculateFee = async () => {
			setIsLoadingFee(true);

			const transactionFees = await calculate({
				coin: network.coin(),
				data,
				network: network.id(),
				type,
			});

			if (getValues("gasPrice") === undefined) {
				setValue("gasPrice", transactionFees.avg, { shouldDirty: true, shouldValidate: true });
			}

			setValue("fees", transactionFees, { shouldDirty: true, shouldValidate: true });
			setIsLoadingFee(false);
		};

		void recalculateFee();
	}, [calculate, data, getValues, network.id(), setValue, type]);

	return (
		<InputFee
			min={fees?.min}
			avg={fees?.avg}
			max={fees?.max}
			loading={!fees || isLoadingFee}
			gasPrice={gasPrice}
			gasLimit={gasLimit}
			defaultGasLimit={gasLimit ?? GasLimit[type]}
			minGasPrice={MIN_GAS_PRICE}
			gasPriceStep={1}
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
					{ ...inputFeeSettings, selectedFeeOption: option },
					{ shouldDirty: true, shouldValidate: true },
				);
			}}
		/>
	);
};
