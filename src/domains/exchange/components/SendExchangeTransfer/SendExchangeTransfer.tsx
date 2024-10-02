import {Contracts, DTO} from "@ardenthq/sdk-profiles";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import { useTranslation } from "react-i18next";

import { Modal } from "@/app/components/Modal";
import { Form, FormButtons, FormField, FormLabel } from "@/app/components/Form";
import { SelectAddress } from "@/domains/profile/components/SelectAddress";
import { useActiveProfile, useFees } from "@/app/hooks";
import { DetailDivider, DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { Address } from "@/app/components/Address";
import { Amount, AmountLabel } from "@/app/components/Amount";
import { Networks } from "@ardenthq/sdk";
import { buildTransferData } from "@/domains/transaction/pages/SendTransfer/SendTransfer.helpers";
import { useExchangeRate } from "@/app/hooks/use-exchange-rate";
import { AuthenticationStep } from "@/domains/transaction/components/AuthenticationStep";
import { TransferLedgerReview } from "@/domains/transaction/pages/SendTransfer/LedgerReview";
import { useSendTransferForm } from "@/domains/transaction/hooks/use-send-transfer-form";
import { useLedgerContext } from "@/app/contexts";
import { Button } from "@/app/components/Button";
import {Alert} from "@/app/components/Alert";

interface TransferProperties {
	onClose: () => void;
	onSuccess: () => void;
	exchangeTransaction: Contracts.IExchangeTransaction;
}

export const SendExchangeTransfer: React.FC<TransferProperties> = ({
	onClose,
	onSuccess,
	exchangeTransaction,
}) => {
	const { t } = useTranslation();

	const profile = useActiveProfile();

	const network = useMemo(() => {
		return profile.availableNetworks().find((network) => network.id() === "ark.devnet");
	}, [profile]) as Networks.Network;

	const wallets = useMemo(() => {
		return profile.wallets().findByCoinWithNetwork(network.coin(), network.id());
	}, [network, profile]);

	const [senderWallet, setSenderWallet] = useState<Contracts.IReadWriteWallet | undefined>(() =>
		wallets.length === 1 ? wallets[0] : undefined,
	);

	const exchangeInput = exchangeTransaction.input();

	const recipients = useMemo(
		() => [
			{
				// address: exchangeInput.address,
				// amount: exchangeInput.amount,
				address: "DMFzWa3nHt9T1ChXdMwFrBZRTfKMjDyNss",
				amount: 0.001,
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


	console.log({ isValid, isSubmitting, values: getValues(), errors: form.errors });

	useEffect(() => {
		form.setValue("recipients", recipients, { shouldDirty: true, shouldValidate: true });
	}, [recipients]);

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

	const handleSenderWallet = (address: string) => {
		const wallet = profile.wallets().findByAddressWithNetwork(address, network.id());
		console.log(wallet?.balance("available"))
		setSenderWallet(wallet);
	};

	const ticker = network.ticker();
	const exchangeTicker = profile.settings().get<string>(Contracts.ProfileSetting.ExchangeCurrency) as string;
	const { convert } = useExchangeRate({ exchangeTicker, ticker });

	const [transaction, setTransaction] = useState<DTO.ExtendedSignedTransactionData | undefined>(undefined);
	const [errorMessage, setErrorMessage] = useState<string | undefined>();

	const abortReference = useRef(new AbortController());

	const submit = useCallback(
		async () => {
			setErrorMessage(undefined);

			try {
				const transaction = await submitForm(abortReference);

				setTransaction(transaction);
				onSuccess();
			} catch (error) {
				setErrorMessage((error?.message ?? "") as string);
			}
		},
		[onSuccess, submitForm],
	);

	if (transaction) {
		return (<Modal isOpen onClose={onClose} title={"Sign Exchange Transaction"}>
			<div>
				<Alert variant="success"> {t("EXCHANGE.TRANSACTION_SENT")} </Alert>
				<FormButtons>
					<Button
						data-testid="ExchangeTransfer__continue"
						onClick={onClose}
					>
						<span>{t("COMMON.CONTINUE")}</span>
					</Button>
				</FormButtons>
			</div>
		</Modal>)
	}

	return (
		<Modal isOpen onClose={onClose} title={"Sign Exchange Transaction"}>
			{errorMessage && <Alert variant="danger"> {errorMessage} </Alert> }
			<Form context={form} onSubmit={() => submit()}>
				<div className="mt-4 space-y-4">
					<FormField name="senderAddress">
						<FormLabel label={t("TRANSACTION.SENDER")} />

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
								onChange={handleSenderWallet}
							/>
						</div>
					</FormField>

					<DetailWrapper label={t("TRANSACTION.ADDRESSING")}>
						<div className="flex w-full items-center justify-between gap-4 space-x-2 sm:justify-start sm:space-x-0">
							<DetailTitle className="w-auto sm:min-w-16">{t("COMMON.TO")}</DetailTitle>
							<Address
								address={exchangeInput.address}
								addressClass="text-theme-secondary-900 dark:text-theme-secondary-700 text-sm leading-[17px] sm:leading-5 sm:text-base"
								wrapperClass="justify-end sm:justify-start"
								showCopyButton
							/>
						</div>
					</DetailWrapper>

					<DetailWrapper label={t("TRANSACTION.TRANSACTION_TYPE")}>
						<div className="space-y-3 sm:space-y-0" data-testid="VoteDetail">
							<div className="flex w-full items-center justify-between sm:justify-start">
								<DetailTitle className="w-auto sm:min-w-20">{t("COMMON.AMOUNT")}</DetailTitle>
								<AmountLabel value={exchangeInput.amount} ticker={exchangeInput.ticker} isNegative />
							</div>

							<DetailDivider />

							<div className="flex w-full items-center justify-between sm:justify-start">
								<DetailTitle className="w-auto sm:min-w-20">{t("COMMON.FEE")}</DetailTitle>
								<div className="text-sm font-semibold leading-[17px] text-theme-secondary-900 dark:text-theme-secondary-200 sm:text-base sm:leading-5">
									{fee && <Amount ticker={ticker} value={fee} />}
								</div>
							</div>

							<DetailDivider />

							<div className="flex w-full items-center justify-between sm:justify-start">
								<DetailTitle className="w-auto sm:min-w-20">{t("COMMON.VALUE")}</DetailTitle>
								<div className="text-sm font-semibold leading-[17px] text-theme-secondary-900 dark:text-theme-secondary-200 sm:text-base sm:leading-5">
									<Amount ticker={exchangeTicker} value={convert(exchangeInput.amount)} />
								</div>
							</div>
						</div>
					</DetailWrapper>

					{senderWallet && (
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
