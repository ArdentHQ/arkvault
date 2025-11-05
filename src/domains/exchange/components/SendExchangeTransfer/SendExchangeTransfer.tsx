import { Contracts, DTO } from "@/app/lib/profiles";
import { DetailLabel, DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { Form, FormButtons, FormField, FormLabel } from "@/app/components/Form";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFees, useValidation } from "@/app/hooks";

import { Address } from "@/app/components/Address";
import { Alert } from "@/app/components/Alert";
import { AuthenticationStep } from "@/domains/transaction/components/AuthenticationStep";
import { BigNumber } from "@/app/lib/helpers";
import { Button } from "@/app/components/Button";
import { GasLimit } from "@/domains/transaction/components/FeeField/FeeField";
import { Modal } from "@/app/components/Modal";
import { Networks } from "@/app/lib/mainsail";
import { SelectAddress } from "@/domains/profile/components/SelectAddress";
import { TotalAmountBox } from "@/domains/transaction/components/TotalAmountBox";
import { TransferLedgerReview } from "@/domains/transaction/components/SendTransferSidePanel/LedgerReview";
import { buildTransferData } from "@/domains/transaction/components/SendTransferSidePanel/SendTransfer.helpers";
import { calculateGasFee } from "@/domains/transaction/components/InputFee/InputFee";
import { isLedgerTransportSupported } from "@/app/contexts/Ledger/transport";
import { useLedgerContext } from "@/app/contexts";
import { useSendTransferForm } from "@/domains/transaction/hooks/use-send-transfer-form";
import { useTranslation } from "react-i18next";
import { SelectAddressDropdown } from "@/domains/profile/components/SelectAddressDropdown";

interface TransferProperties {
	onClose: () => void;
	onSuccess: (txId: string) => void;
	profile: Contracts.IProfile;
	network: Networks.Network;
	exchangeTransaction: Contracts.IExchangeTransaction;
}

export const SendExchangeTransfer: React.FC<TransferProperties> = ({
	onClose,
	onSuccess,
	network,
	exchangeTransaction,
	profile,
}) => {
	const { t } = useTranslation();

	const { sendTransfer } = useValidation();

	const [senderWallet, setSenderWallet] = useState<Contracts.IReadWriteWallet | undefined>(() =>
		profile.wallets().count() === 1 ? profile.wallets().first() : undefined,
	);

	const exchangeInput = exchangeTransaction.input();

	const recipients = useMemo(
		() => [
			{
				address: exchangeInput.address,
				amount: exchangeInput.amount,
			},
		],
		[exchangeInput],
	);

	const {
		form,
		submitForm,
		lastEstimatedExpiration,
		values: { gasPrice, gasLimit },
		formState: { isValid, isSubmitting },
		handleSubmit,
	} = useSendTransferForm(senderWallet);

	const fee = calculateGasFee(gasPrice, gasLimit);

	useEffect(() => {
		const netBalance = BigNumber.make(senderWallet?.balance() || 0).minus(fee || 0);
		const remainingNetBalance = netBalance.isGreaterThan(0) ? netBalance.toFixed(10) : "0";

		form.register("amount", sendTransfer.amount(network, remainingNetBalance, recipients, true));

		const validate = async () => {
			await form.trigger("amount");

			if (form.errors.amount) {
				form.setError("senderAddress", {
					message: form.errors.amount.message,
					type: form.errors.amount.type,
				});
			}
		};

		if (senderWallet) {
			void validate();
		}
	}, [fee, network, recipients, sendTransfer, senderWallet]);

	useEffect(() => {
		form.setValue("amount", exchangeInput.amount, { shouldDirty: true, shouldValidate: true });
		form.setValue("recipients", recipients, { shouldDirty: true, shouldValidate: true });
	}, [exchangeInput.amount, recipients]);

	const { calculate } = useFees(profile);

	useEffect(() => {
		const calculateFee = async () => {
			const data = buildTransferData({
				recipients,
			});

			const transactionFees = await calculate({
				coin: network.coin(),
				data,
				network: network.id(),
				type: "transfer",
			});

			form.setValue("gasPrice", transactionFees.avg, { shouldDirty: true, shouldValidate: true });
			form.setValue("gasLimit", GasLimit["transfer"], { shouldDirty: true, shouldValidate: true });
			form.setValue("fees", transactionFees, { shouldDirty: true, shouldValidate: true });
		};

		void calculateFee();
	}, [calculate, network, profile, recipients]);

	const { hasDeviceAvailable, isConnected, connect, isAwaitingConnection } = useLedgerContext();

	const [transaction, setTransaction] = useState<DTO.ExtendedSignedTransactionData | undefined>(undefined);
	const [errorMessage, setErrorMessage] = useState<string | undefined>();

	const abortReference = useRef(new AbortController());

	const submit = useCallback(async () => {
		setErrorMessage(undefined);

		try {
			const transaction = await submitForm(abortReference);

			setTransaction(transaction);
			onSuccess(transaction.hash());
		} catch (error) {
			setErrorMessage(error?.message as string);
		}
	}, [onSuccess, submitForm]);

	const handleWalletSelect = (address?: string) => {
		if (!address) {
			setSenderWallet(undefined);
			return;
		}

		const newSenderWallet = profile.wallets().findByAddressWithNetwork(address, network.id());

		const isFullyRestoredAndSynced =
			newSenderWallet?.hasBeenFullyRestored() && newSenderWallet.hasSyncedWithNetwork();

		if (!isFullyRestoredAndSynced) {
			newSenderWallet?.synchroniser().identity();
		}

		setSenderWallet(newSenderWallet);
	};

	useEffect(() => {
		const connectLedgerAndSubmit = async () => {
			if ([transaction, !senderWallet, isConnected, !senderWallet?.isLedger()].some(Boolean)) {
				return;
			}

			if (!isLedgerTransportSupported()) {
				setErrorMessage(t("WALLETS.MODAL_LEDGER_WALLET.COMPATIBILITY_ERROR"));
				return;
			}

			await connect(profile);
			handleSubmit(() => submit())();
		};

		connectLedgerAndSubmit();
	}, [senderWallet, isConnected, transaction]);

	if (transaction) {
		return (
			<Modal
				isOpen
				onClose={onClose}
				title={t("EXCHANGE.MODAL_SIGN_EXCHANGE_TRANSACTION.SUCCESS_TITLE")}
				contentClassName="p-6 sm:p-8 sm:[&>div.absolute]:m-8! [&>div.absolute]:m-6!"
				titleClass="leading-[21px]! sm!:leading-7"
			>
				<div className="mt-4 space-y-4">
					<Alert variant="success"> {t("EXCHANGE.TRANSACTION_SENT")} </Alert>
					<FormButtons>
						<Button data-testid="ExchangeTransfer__continue" onClick={onClose}>
							<span>{t("COMMON.CONTINUE")}</span>
						</Button>
					</FormButtons>
				</div>
			</Modal>
		);
	}

	const isLedger = senderWallet?.isLedger() && (isAwaitingConnection || isConnected);

	return (
		<Modal
			isOpen
			onClose={onClose}
			title={t("EXCHANGE.MODAL_SIGN_EXCHANGE_TRANSACTION.TITLE")}
			titleClass="leading-[21px]! sm!:leading-7 text-theme-text"
		>
			{errorMessage && (
				<div className="mt-4" data-testid="ErrorState">
					<Alert variant="danger"> {errorMessage} </Alert>
				</div>
			)}

			<Form context={form} onSubmit={() => submit()}>
				<div className="mt-4 space-y-4">
					{!errorMessage && (
						<FormField name="senderAddress">
							<FormLabel label={t("TRANSACTION.SENDER")} />
							<div data-testid="sender-address">
								<SelectAddressDropdown
									disabled={profile.wallets().count() === 1}
									profile={profile}
									onChange={(wallet) => {
										handleWalletSelect(wallet?.address());
									}}
									wallets={profile.wallets().values()}
									wallet={senderWallet}
									defaultNetwork={network}
									showBalance
								/>
							</div>
						</FormField>
					)}

					{!isLedger && (
						<DetailWrapper label={t("TRANSACTION.ADDRESSING")}>
							<div className="flex w-full items-center justify-between gap-4 space-x-2 sm:justify-start sm:space-x-0">
								<DetailTitle className="w-auto sm:min-w-16">{t("COMMON.TO")}</DetailTitle>
								<Address
									address={exchangeInput.address}
									addressClass="text-theme-secondary-900 dark:text-theme-secondary-200 text-sm leading-[17px] sm:leading-5 sm:text-base"
									wrapperClass="justify-end sm:justify-start"
									showCopyButton
								/>
							</div>
						</DetailWrapper>
					)}

					{senderWallet && (
						<>
							{!isLedger && (
								<div className="space-y-3 sm:space-y-2">
									<DetailLabel>{t("COMMON.TRANSACTION_SUMMARY")}</DetailLabel>
									<TotalAmountBox
										amount={exchangeInput.amount}
										fee={fee || 0}
										ticker={senderWallet.currency()}
										convertValues={!senderWallet.network().isTest()}
									/>
								</div>
							)}

							{!errorMessage && (
								<AuthenticationStep
									noHeading
									wallet={senderWallet}
									ledgerDetails={
										<TransferLedgerReview
											wallet={senderWallet}
											estimatedExpiration={lastEstimatedExpiration}
											profile={profile}
										/>
									}
									ledgerIsAwaitingDevice={!hasDeviceAvailable}
									ledgerIsAwaitingApp={!isConnected}
									onDeviceNotAvailable={() => {
										setErrorMessage(t("WALLETS.MODAL_LEDGER_WALLET.DEVICE_NOT_AVAILABLE"));
									}}
								/>
							)}
						</>
					)}
				</div>
				<div className="modal-footer">
					<FormButtons>
						<Button data-testid="ExchangeTransfer__cancel-button" variant="secondary" onClick={onClose}>
							{t("COMMON.CANCEL")}
						</Button>

						<Button
							type="submit"
							data-testid="ExchangeTransfer__send-button"
							disabled={
								isSubmitting || !isValid || !!errorMessage || isAwaitingConnection || !senderWallet
							}
							isLoading={isSubmitting}
							icon="DoubleArrowRight"
							iconPosition="right"
						>
							<span>{t("COMMON.SEND")}</span>
						</Button>
					</FormButtons>
				</div>
			</Form>
		</Modal>
	);
};
