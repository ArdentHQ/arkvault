import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useFormContext } from "react-hook-form";

import { useDebounce, useFees } from "@/app/hooks";
import { InputFee } from "@/domains/transaction/components/InputFee";

interface Properties {
	type:
		| "transfer"
		| "multiPayment"
		| "vote"
		| "delegateRegistration"
		| "delegateResignation"
		| "multiSignature"
		| "usernameRegistration"
		| "usernameResignation";
	data: Record<string, any> | undefined;
	network: Networks.Network;
	profile: Contracts.IProfile;
}

export const GasLimit: Record<Properties["type"], number> = {
	delegateRegistration: 500_000,
	delegateResignation: 150_000,
	multiPayment: 21_000,
	multiSignature: 21_000,
	transfer: 21_000,
	usernameRegistration: 200_000,
	usernameResignation: 200_000,
	vote: 200_000,
};

export const MIN_GAS_PRICE = 5;

export const FeeField: React.FC<Properties> = ({ type, network, profile, ...properties }: Properties) => {
	const { calculate } = useFees(profile);
	const { setValue, getValues, watch } = useFormContext();

	const [isLoadingFee, setIsLoadingFee] = useState(false);
	const [fees, setFees] = useState<Record<string, any> | undefined>(undefined);

	const gasPriceRef = useRef<number | undefined>(getValues("gasPrice"));
	const gasLimitRef = useRef<number | undefined>(getValues("gasLimit"));

	const [data, _isLoadingData] = useDebounce(properties.data, 700);
	const inputFeeSettings = watch("inputFeeSettings") || {};

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
			if (gasPriceRef.current === undefined) {
				gasPriceRef.current = transactionFees.avg;
				setValue("gasPrice", transactionFees.avg, { shouldDirty: true, shouldValidate: true });
			}

			if (gasLimitRef.current === undefined) {
				gasLimitRef.current = GasLimit[type];
				setValue("gasLimit", GasLimit[type], { shouldDirty: true, shouldValidate: true });
			}

			setFees(transactionFees);
			setIsLoadingFee(false);
		};

		void recalculateFee();
	}, [calculate, data, network.id(), setValue, type]);

	const handleGasPriceChange = useCallback(
		(value: number) => {
			if (gasPriceRef.current !== value) {
				gasPriceRef.current = value;
				setValue("gasPrice", value, { shouldDirty: true, shouldValidate: true });
			}
		},
		[setValue],
	);

	const handleGasLimitChange = useCallback(
		(value: number) => {
			if (gasLimitRef.current !== value) {
				gasLimitRef.current = value;
				setValue("gasLimit", value, { shouldDirty: true, shouldValidate: true });
			}
		},
		[setValue],
	);

	const handleViewTypeChange = useCallback(
		(viewType) => {
			setValue(
				"inputFeeSettings",
				{ ...inputFeeSettings, viewType },
				{ shouldDirty: true, shouldValidate: true },
			);
		},
		[setValue, inputFeeSettings],
	);

	const handleFeeOptionChange = useCallback(
		(option) => {
			setValue(
				"inputFeeSettings",
				{ ...inputFeeSettings, selectedFeeOption: option },
				{ shouldDirty: true, shouldValidate: true },
			);
		},
		[setValue, inputFeeSettings],
	);

	return useMemo(
		() => (
			<InputFee
				min={fees?.min}
				avg={fees?.avg}
				max={fees?.max}
				loading={!fees || isLoadingFee}
				gasPrice={gasPriceRef.current || 0}
				gasLimit={gasLimitRef.current || 0}
				defaultGasLimit={GasLimit[type]}
				minGasPrice={MIN_GAS_PRICE}
				gasPriceStep={1}
				network={network}
				profile={profile}
				onChangeGasPrice={handleGasPriceChange}
				onChangeGasLimit={handleGasLimitChange}
				viewType={inputFeeSettings.viewType}
				onChangeViewType={handleViewTypeChange}
				selectedFeeOption={inputFeeSettings.selectedFeeOption}
				onChangeFeeOption={handleFeeOptionChange}
			/>
		),
		[
			fees,
			isLoadingFee,
			network,
			profile,
			handleGasPriceChange,
			handleGasLimitChange,
			inputFeeSettings.viewType,
			inputFeeSettings.selectedFeeOption,
			handleViewTypeChange,
			handleFeeOptionChange,
			type,
		],
	);
};
