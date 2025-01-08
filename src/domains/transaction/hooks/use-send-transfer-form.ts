import { Networks, Services } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
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
import { getTransferType, handleBroadcastError } from "@/domains/transaction/utils";
import { precisionRound } from "@/utils/precision-round";
import { useTransactionQueryParameters } from "@/domains/transaction/hooks/use-transaction-query-parameters";
import { profileEnabledNetworkIds } from "@/utils/network-utils";

export const useSendTransferForm = (wallet?: Contracts.IReadWriteWallet) => {
	const [lastEstimatedExpiration, setLastEstimatedExpiration] = useState<number | undefined>();

	const activeProfile = useActiveProfile();

	const networkPredicate = useMemo(
		() => (network: Networks.Network) => profileEnabledNetworkIds(activeProfile).includes(network.id()),
		[activeProfile],
	);

	const networks = useNetworks({
		filter: networkPredicate,
		profile: activeProfile,
	});

	const transactionBuilder = useTransactionBuilder();
	const { persist } = useEnvironmentContext();
	const { hasAnyParameters, queryParameters } = useTransactionQueryParameters();

	const formDefaultValues = useMemo<DefaultValues<SendTransferForm>>(
		() => ({
			amount: "",
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
				isMultiSignature: signatory.actsWithMultiSignature() || signatory.hasMultiSignature(),
				memo,
				recipients,
			});

			setLastEstimatedExpiration(data.expiration);

			// @TODO: Remove hardcoded fee once fees are implemented for evm.
			const transactionInput: Services.TransactionInputs = { data, fee: 5, signatory };

			const abortSignal = abortReference.current.signal;
			const { uuid, transaction } = await transactionBuilder.build(
				getTransferType({ recipients }),
				transactionInput,
				wallet,
				{
					abortSignal,
				},
			);
			const response = await wallet.transaction().broadcast(uuid);

			handleBroadcastError(response);

			await wallet.transaction().sync();

			await persist();

			return transaction;
		},
		[activeProfile, clearErrors, getValues, persist, transactionBuilder, wallet],
	);

	const walletBalance = wallet?.balance();
	useEffect(() => {
		register("remainingBalance");
		register("network", sendTransferValidation.network());
		register("recipients", sendTransferValidation.recipients());
		register("senderAddress", sendTransferValidation.senderAddress());
		register("fees");
		register("gasPrice", commonValidation.gasPrice(walletBalance, getValues, 5, wallet?.network()));
		register("gasLimit", commonValidation.gasLimit(walletBalance, getValues, 21_000, wallet?.network()));
		register("memo", sendTransferValidation.memo());

		register("remainingBalance");
		register("isSendAllSelected");
		register("inputFeeSettings");

		register("suppressWarning");

		if (networks.length === 1) {
			setValue("network", networks[0], { shouldDirty: true, shouldValidate: true });
		}
	}, [register, sendTransferValidation, commonValidation, fees, wallet, remainingBalance, amount, senderAddress]);

	useEffect(() => {
		if (!hasAnyParameters) {
			return;
		}

		setValue(
			"network",
			networks.find((item) => {
				/* istanbul ignore else -- @preserve */
				if (lowerCaseEquals(item.coin(), queryParameters.coin)) {
					if (queryParameters.network) {
						return lowerCaseEquals(item.id(), queryParameters.network);
					}

					/* istanbul ignore else -- @preserve */
					if (queryParameters.nethash) {
						return item.meta().nethash === queryParameters.nethash;
					}
				}
			}),
		);

		if (queryParameters.memo) {
			setValue("memo", queryParameters.memo, {
				shouldDirty: true,
				shouldValidate: true,
			});
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

		setValue("network", wallet.network(), { shouldDirty: true, shouldValidate: true });
	}, [wallet, setValue]);

	useEffect(() => {
		if (!isSendAllSelected) {
			return;
		}

		const remaining = remainingBalance - fee;

		// Using `8` for precision because is the maximum number of decimals
		// that the amount field supports.
		setValue("amount", precisionRound(remaining, 8));

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
