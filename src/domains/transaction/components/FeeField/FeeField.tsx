import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

import { useDebounce, useFees } from "@/app/hooks";
import { InputFee } from "@/domains/transaction/components/InputFee";

interface Properties {
	type: "transfer"|"multiPayment"|"vote"|"delegateRegistration"|"delegateResignation"|"multiSignature";
	data: Record<string, any> | undefined;
	network: Networks.Network;
	profile: Contracts.IProfile;
}

const GasLimit: Record<Properties['type'], number> = {
	delegateRegistration: 500_000,
	delegateResignation: 150_000,
	multiPayment: 21_000,
	multiSignature: 21_000,
	transfer: 21_000,
	vote: 200_000,
}

export const FeeField: React.FC<Properties> = ({ type, network, profile, ...properties }: Properties) => {
	const { calculate } = useFees(profile);

	const [isLoadingFee, setIsLoadingFee] = useState(false);

	const { watch, setValue, getValues } = useFormContext();
	const { fees, inputFeeSettings = {} } = watch(["fees", "inputFeeSettings"]);

	const gasPrice = getValues("gasPrice") as number;
	const gasLimit = getValues("gasLimit") as number;

	console.log({gasLimit, gasPrice})

	const [data, _isLoadingData] = useDebounce(properties.data, 700);

	useEffect(() => {
		const recalculateFee = async () => {
			setIsLoadingFee(true);

			const transactionFees = await calculate({
				coin: network.coin(),
				data,
				network: network.id(),
				type,
			});

			/* istanbul ignore else -- @preserve */
			if (getValues("gasPrice") === undefined) {
				setValue("gasPrice", transactionFees.avg, { shouldDirty: true, shouldValidate: true });
			}

			setValue("fees", transactionFees, { shouldDirty: true, shouldValidate: true });

			setIsLoadingFee(false);
		};

		void recalculateFee();
	}, [
		calculate,
		data,
		getValues,
		network,
		setValue,
		type,
	]);

	return (
		<InputFee
			min={fees?.min}
			avg={fees?.avg}
			max={fees?.max}
			loading={!fees || isLoadingFee}
			gasPrice={gasPrice}
			gasLimit={gasLimit}
			defaultGasLimit={GasLimit[type]}
			minGasPrice={5}
			step={1}
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
