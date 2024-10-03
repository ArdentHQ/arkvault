import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Modal } from "@/app/components/Modal";
import { Form, FormButtons, FormField, FormLabel } from "@/app/components/Form";
import { SelectAddress } from "@/domains/profile/components/SelectAddress";
import {useActiveProfile, useFees, useValidation} from "@/app/hooks";
import {DetailLabel, DetailTitle, DetailWrapper} from "@/app/components/DetailWrapper";
import { Address } from "@/app/components/Address";
import { Networks } from "@ardenthq/sdk";
import { buildTransferData } from "@/domains/transaction/pages/SendTransfer/SendTransfer.helpers";
import { AuthenticationStep } from "@/domains/transaction/components/AuthenticationStep";
import { TransferLedgerReview } from "@/domains/transaction/pages/SendTransfer/LedgerReview";
import { useSendTransferForm } from "@/domains/transaction/hooks/use-send-transfer-form";
import { useLedgerContext } from "@/app/contexts";
import { Button } from "@/app/components/Button";
import { Alert } from "@/app/components/Alert";
import {TotalAmountBox} from "@/domains/transaction/components/TotalAmountBox";
import {BigNumber} from "@ardenthq/sdk-helpers";

interface TransferProperties {
	onClose: () => void;
	onSuccess: () => void;
	exchangeTransaction: Contracts.IExchangeTransaction;
}

export const SendExchangeTransfer: React.FC<TransferProperties> = ({ onClose, onSuccess, exchangeTransaction }) => {
	const { t } = useTranslation();

	const profile = useActiveProfile();

	const { sendTransfer } = useValidation();

	const network = useMemo(
		() => profile.availableNetworks().find((network) => network.id() === "ark.mainnet"),
		[profile],
	) as Networks.Network;

	const wallets = useMemo(
		() => profile.wallets().findByCoinWithNetwork(network.coin(), network.id()),
		[network, profile],
	);

	const [senderWallet, setSenderWallet] = useState<Contracts.IReadWriteWallet | undefined>(() =>
		wallets.length === 1 ? wallets[0] : undefined,
	);

	const exchangeInput = exchangeTransaction.input();

	const recipients = useMemo(
		() => [
			{
				address: exchangeInput.address,
				amount: exchangeInput.amount,
				// address: "DMFzWa3nHt9T1ChXdMwFrBZRTfKMjDyNss",
				// amount: 0.001,
				// amount: 75
			},
		],
		[exchangeInput],
	);

	const {
		form,
		submitForm,
		getValues,
		lastEstimatedExpiration,
		values: { fee},
		formState: { isValid, isSubmitting },
	} = useSendTransferForm(senderWallet);

	console.log({ errors: form.errors, isSubmitting, isValid, values: getValues() });

	useEffect(() => {
		form.setValue("recipients", recipients, { shouldDirty: true, shouldValidate: true });
	}, [recipients]);

	useEffect(() => {
		const netBalance = BigNumber.make(senderWallet?.balance() || 0).minus(fee || 0);
		const remainingNetBalance = netBalance.isGreaterThan(0) ? netBalance.toFixed(10) : "0";

		form.register("senderAddress", sendTransfer.amount(network, remainingNetBalance, recipients, true))

		if (senderWallet) {
			void form.trigger("senderAddress")
		}
	}, [fee, network, recipients, sendTransfer, senderWallet]);


	const { calculate } = useFees(profile);

	useEffect(() => {
		const calculateFee = async () => {
			const data = await buildTransferData({
				coin: profile.coins().get(network.coin(), network.id()),
				recipients,
			});

			const transactionFees = await calculate({
				coin: network.coin(),
				data,
				network: network.id(),
				type: "transfer",
			});

			form.setValue("fee", transactionFees.min, { shouldDirty: true, shouldValidate: true });
			form.setValue("fees", transactionFees, { shouldDirty: true, shouldValidate: true });
		};

		void calculateFee();
	}, [calculate, network, profile, recipients]);

	const { hasDeviceAvailable, isConnected, connect: _c } = useLedgerContext();

	const [transaction, setTransaction] = useState<DTO.ExtendedSignedTransactionData | undefined>(undefined);
	const [errorMessage, setErrorMessage] = useState<string | undefined>();

	const abortReference = useRef(new AbortController());

	const submit = useCallback(async () => {
		setErrorMessage(undefined);

		try {
			const transaction = await submitForm(abortReference);

			setTransaction(transaction);
			onSuccess();
		} catch (error) {
			setErrorMessage((error?.message ?? "") as string);
		}
	}, [onSuccess, submitForm]);

	if (transaction) {
		return (
			<Modal isOpen onClose={onClose} title={"Sign Exchange Transaction"}>
				<div>
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

	return (
		<Modal
			isOpen
			onClose={onClose}
			title={"Sign Exchange Transaction"}
			contentClassName="p-6 sm:p-8 sm:[&>div.absolute]:!m-8 [&>div.absolute]:!m-6"
			titleClass="!leading-[21px] sm!:leading-7"
		>
			{errorMessage && <Alert variant="danger"> {errorMessage} </Alert>}
			<Form context={form} onSubmit={() => submit()}>
				<div className="mt-4 space-y-4">
					<FormField name="senderAddress">
						<FormLabel label={t("TRANSACTION.SENDER")}/>

						<div data-testid="sender-address">
							<SelectAddress
								showWalletAvatar={false}
								wallet={
									senderWallet
										? {
											address: senderWallet.address(),
											network: senderWallet.network(),
										}
										: undefined
								}
								wallets={wallets}
								profile={profile}
								disabled={wallets.length === 1}
								onChange={(address: string) => {
									setSenderWallet(profile.wallets().findByAddressWithNetwork(address, network.id()));
								}}
							/>
						</div>
					</FormField>

					<DetailWrapper label={t("TRANSACTION.ADDRESSING")}>
						<div
							className="flex w-full items-center justify-between gap-4 space-x-2 sm:justify-start sm:space-x-0">
							<DetailTitle className="w-auto sm:min-w-16">{t("COMMON.TO")}</DetailTitle>
							<Address
								address={exchangeInput.address}
								addressClass="text-theme-secondary-900 dark:text-theme-secondary-700 text-sm leading-[17px] sm:leading-5 sm:text-base"
								wrapperClass="justify-end sm:justify-start"
								showCopyButton
							/>
						</div>
					</DetailWrapper>

					{senderWallet && (
						<>
							<div className="space-y-3 sm:space-y-2">
								<DetailLabel>{t("COMMON.TRANSACTION_SUMMARY")}</DetailLabel>
								<TotalAmountBox amount={exchangeInput.amount} fee={fee || 0}
												ticker={senderWallet.currency()}/>
							</div>
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
									// @TODO handle ledger
								}}
							/>
						</>
					)}
				</div>
				<FormButtons>
					<Button data-testid="ExchangeTransfer__cancel-button" variant="secondary" onClick={onClose}>
						{t("COMMON.CANCEL")}
					</Button>

					<Button
						type="submit"
						data-testid="ExchangeTransfer__send-button"
						disabled={isSubmitting || !isValid}
						isLoading={isSubmitting}
						icon="DoubleArrowRight"
						iconPosition="right"
					>
						<span>{t("COMMON.SEND")}</span>
					</Button>
				</FormButtons>
			</Form>
		</Modal>
	);
};
