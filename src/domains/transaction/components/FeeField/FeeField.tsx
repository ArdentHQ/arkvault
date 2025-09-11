import { Networks } from "@/app/lib/mainsail";
import { Contracts } from "@/app/lib/profiles";
import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

import { useDebounce, useFees } from "@/app/hooks";
import { InputFee } from "@/domains/transaction/components/InputFee";
import { InputFeeViewType } from "@/domains/transaction/components/InputFee/InputFee.contracts";
import { BigNumber } from "@/app/lib/helpers";
import { EncodeTransactionType } from "@/app/lib/mainsail/transaction-encoder";

interface Properties {
	type: EncodeTransactionType;
	data: Record<string, any> | undefined;
	network: Networks.Network;
	profile: Contracts.IProfile;
}

const gasLimit21k = BigNumber.make(21_000);
export const GasLimit: Record<Properties["type"], BigNumber> = {
	multiPayment: gasLimit21k,
	multiSignature: gasLimit21k,
	transfer: gasLimit21k,
	// updateValidator uses `evmCall`
	updateValidator: BigNumber.make(200_000),
	usernameRegistration: BigNumber.make(200_000),
	usernameResignation: BigNumber.make(200_000),
	validatorRegistration: BigNumber.make(400_000),
	validatorResignation: BigNumber.make(150_000),
	vote: BigNumber.make(200_000),
};

export const FeeField: React.FC<Properties> = ({ type, network, profile, ...properties }: Properties) => {
	const { calculate, estimateGas } = useFees(profile);

	const [isLoadingFee, setIsLoadingFee] = useState(false);
	const [estimatedGasLimit, setEstimatedGasLimit] = useState(BigNumber.make(0));

	const { watch, setValue, getValues } = useFormContext();
	const { fees, inputFeeSettings = {} } = watch(["fees", "inputFeeSettings"]);

	const gasPrice = BigNumber.make(getValues("gasPrice") ?? 0);
	const gasLimit = BigNumber.make(getValues("gasLimit") ?? 0);

	const [data, _isLoadingData] = useDebounce(properties.data, 700);
	const recipientsCount = Array.isArray(properties.data?.payments) ? properties.data.payments.length : 1;

	useEffect(() => {
		/* istanbul ignore else -- @preserve */
		const isMultiPayment = type === "multiPayment";
		const fallbackGasLimit = isMultiPayment ? GasLimit.multiPayment.times(recipientsCount) : GasLimit[type];

		const estimate = async () => {
			let gasLimit = fallbackGasLimit;

			try {
				gasLimit = await estimateGas({
					data: { senderAddress: data?.senderAddress!, ...getValues(), ...data },
					type,
				});

				if (gasLimit.isZero()) {
					gasLimit = fallbackGasLimit;
				}
			} catch (error) {
				console.warn(error);
			}

			setEstimatedGasLimit(gasLimit);
			setValue("gasLimit", gasLimit, { shouldDirty: true, shouldValidate: true });
		};

		void estimate();
	}, [estimateGas, getValues, setValue, type, recipientsCount]);

	const dataDep = JSON.stringify(data ?? []);

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
	}, [calculate, dataDep, getValues, network.id(), setValue, type]);

	return (
		<InputFee
			min={fees?.min}
			avg={fees?.avg}
			max={fees?.max}
			loading={!fees || isLoadingFee}
			gasPrice={gasPrice}
			gasLimit={gasLimit}
			estimatedGasLimit={estimatedGasLimit}
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

				if (viewType === InputFeeViewType.Advanced) {
					setValue("gasLimit", estimatedGasLimit, { shouldDirty: true, shouldValidate: true });
				}
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
