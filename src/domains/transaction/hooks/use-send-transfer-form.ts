import { Services } from "@payvo/sdk";
import { Contracts } from "@payvo/sdk-profiles";
import { MutableRefObject, useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { DefaultValues } from "react-hook-form/dist/types/form";
import { assertWallet } from "@/utils/assertions";
import { lowerCaseEquals } from "@/utils/equals";
import { useEnvironmentContext } from "@/app/contexts";
import { useActiveProfile, useNetworks, useValidation } from "@/app/hooks";
import { useTransactionBuilder } from "@/domains/transaction/hooks/use-transaction-builder";
import { SendTransferForm } from "@/domains/transaction/pages/SendTransfer";
import { buildTransferData } from "@/domains/transaction/pages/SendTransfer/SendTransfer.helpers";
import { handleBroadcastError } from "@/domains/transaction/utils";

import { useTransactionQueryParameters } from "@/domains/transaction/hooks/use-transaction-query-parameters";

export const useSendTransferForm = (wallet?: Contracts.IReadWriteWallet) => {
	const [lastEstimatedExpiration, setLastEstimatedExpiration] = useState<number | undefined>();

	const activeProfile = useActiveProfile();
	const networks = useNetworks(activeProfile);
	const onlyHasOneNetwork = networks.length === 1;
	const transactionBuilder = useTransactionBuilder();
	const { persist } = useEnvironmentContext();
	const { hasAnyParameters, queryParameters } = useTransactionQueryParameters();

	const formDefaultValues = useMemo<DefaultValues<SendTransferForm>>(
		() => ({
			amount: 0,
			recipients: [],
			remainingBalance: wallet?.balance(),
		}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);
	const form = useForm<SendTransferForm>({
		defaultValues: formDefaultValues,
		mode: "onChange",
	});
	const { clearErrors, formState, getValues, register, setValue, handleSubmit, watch, reset, trigger } = form;

	const { senderAddress, fees, fee, remainingBalance, amount, isSendAllSelected, network } = watch();
	const { sendTransfer: sendTransferValidation, common: commonValidation } = useValidation();

	const resetForm = useCallback(
		(callback?: () => void) => {
			reset({ ...formDefaultValues, network });
			setLastEstimatedExpiration(undefined);
			if (callback) {
				callback();
			}
		},
		[reset, formDefaultValues, network],
	);

	const submitForm = useCallback(
		// TODO: make it as separate async redux-saga generator
		async (abortReference: MutableRefObject<AbortController>) => {
			assertWallet(wallet);

			clearErrors("mnemonic");

			const {
				fee,
				mnemonic,
				secondMnemonic,
				recipients,
				memo,
				encryptionPassword,
				wif,
				privateKey,
				secret,
				secondSecret,
			} = getValues();
			const isMultiPayment = recipients.length > 1;
			const transactionType = isMultiPayment ? "multiPayment" : "transfer";

			const signatory = await wallet.signatoryFactory().make({
				encryptionPassword,
				mnemonic,
				privateKey,
				secondMnemonic,
				secondSecret,
				secret,
				wif,
			});

			const data = await buildTransferData({
				coin: wallet.coin(),
				memo,
				recipients,
			});

			setLastEstimatedExpiration(data.expiration);

			const transactionInput: Services.TransactionInputs = { data, fee: +fee, signatory };

			const abortSignal = abortReference.current.signal;
			const { uuid, transaction } = await transactionBuilder.build(transactionType, transactionInput, wallet, {
				abortSignal,
			});

			const response = await wallet.transaction().broadcast(uuid);

			handleBroadcastError(response);

			await wallet.transaction().sync();

			await persist();

			return transaction;
		},
		[activeProfile, clearErrors, getValues, persist, transactionBuilder, wallet],
	);

	useEffect(() => {
		register("remainingBalance");
		register("network", sendTransferValidation.network());
		register("recipients", sendTransferValidation.recipients());
		register("senderAddress", sendTransferValidation.senderAddress());
		register("fees");
		register("fee", commonValidation.fee(remainingBalance, wallet?.network(), fees));
		register("memo", sendTransferValidation.memo());

		register("remainingBalance");
		register("isSendAllSelected");
		register("inputFeeSettings");

		register("suppressWarning");

		if (onlyHasOneNetwork) {
			console.log(":D")
			setValue("network", networks[0], { shouldDirty: true, shouldValidate: true });
		}
	}, [register, sendTransferValidation, commonValidation, fees, wallet, remainingBalance, amount, senderAddress]);

	useEffect(() => {
		if (!hasAnyParameters) {
			return;
		}

		setValue(
			"network",
			networks.find(
				(item) =>
					lowerCaseEquals(item.coin(), queryParameters.coin) &&
					lowerCaseEquals(item.id(), queryParameters.network),
			),
		);

		if (queryParameters.memo) {
			setValue("memo", queryParameters.memo);
		}

		if (queryParameters.recipient) {
			setTimeout(
				() =>
					setValue("recipientAddress", queryParameters.recipient, {
						shouldDirty: true,
						shouldValidate: false,
					}),
				0,
			);
		}
	}, [queryParameters, setValue, networks, hasAnyParameters]);

	useEffect(() => {
		if (!wallet) {
			return;
		}

		setValue("senderAddress", wallet.address(), { shouldDirty: true, shouldValidate: true });

		for (const network of networks) {
			/* istanbul ignore else */
			if (network.coin() === wallet.coinId() && network.id() === wallet.networkId()) {
				setValue("network", network, { shouldDirty: true, shouldValidate: true });
				break;
			}
		}
	}, [wallet, networks, setValue]);

	useEffect(() => {
		if (!isSendAllSelected) {
			return;
		}

		const remaining = remainingBalance - fee;

		setValue("amount", remaining);

		void trigger(["fee", "amount"]);
	}, [fee]); // eslint-disable-line react-hooks/exhaustive-deps

	return {
		form,
		formState,
		getValues,
		handleSubmit,
		lastEstimatedExpiration,
		resetForm,
		submitForm,
		values: { fee, fees, network, senderAddress },
	};
};
