import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Address } from "@/app/components/Address";
import { Alert } from "@/app/components/Alert";
import { Avatar } from "@/app/components/Avatar";
import { Clipboard } from "@/app/components/Clipboard";
import { Icon } from "@/app/components/Icon";
import { Image } from "@/app/components/Image";
import { getMultiSignatureInfo } from "@/domains/transaction/components/MultiSignatureDetail/MultiSignatureDetail.helpers";
import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";
import {
	TransactionDetail,
	TransactionExplorerLink,
	TransactionNetwork,
	TransactionSender,
	TransactionType,
	TransactionRecipients,
	TransactionAmount,
} from "@/domains/transaction/components/TransactionDetail";
import { ExtendedSignedTransactionData } from "@/domains/transaction/pages/SendRegistration/SendRegistration.contracts";
import { assertString } from "@/utils/assertions";
import { StepHeader } from "@/app/components/StepHeader";
import { useBreakpoint } from "@/app/hooks";

interface TransactionSuccessfulProperties {
	children?: React.ReactNode;
	transaction?: ExtendedSignedTransactionData;
	senderWallet: Contracts.IReadWriteWallet;
	title?: string;
	description?: string;
	banner?: string;
	showExplorerLink?: boolean;
}

const addressFromPublicKey = async (wallet: Contracts.IReadWriteWallet, publicKey?: string) => {
	if (publicKey === wallet.publicKey() && wallet.isLedger()) {
		const derivationPath = wallet.data().get(Contracts.WalletData.DerivationPath);
		assertString(derivationPath);

		const ledgerWalletPublicKey = await wallet.ledger().getPublicKey(derivationPath);
		const { address } = await wallet.coin().address().fromPublicKey(ledgerWalletPublicKey);

		return address;
	}

	assertString(publicKey);

	const { address } = await wallet.coin().address().fromPublicKey(publicKey);

	return address;
};

export const MultiSignatureSuccessful = ({
	children,
	transaction,
	senderWallet,
	title,
	description,
	banner,
}: TransactionSuccessfulProperties) => {
	const { t } = useTranslation();
	const { isXs, isSm } = useBreakpoint();

	const [generatedAddress, setGeneratedAddress] = useState<string>();
	const [participantAddresses, setParticipantAddresses] = useState<RecipientItem[]>([]);

	const [minParticipants, setMinParticipants] = useState<number>();
	const [publicKeys, setPublicKeys] = useState<string[]>();

	useEffect(() => {
		const fetchData = async () => {
			if (!transaction) {
				return;
			}

			const { min, publicKeys } = getMultiSignatureInfo(transaction);

			try {
				const { address } = await senderWallet
					.coin()
					.address()
					.fromMultiSignature({ min, publicKeys, senderPublicKey: senderWallet.publicKey() });

				setGeneratedAddress(address);
				/* istanbul ignore next -- @preserve */
			} catch {
				// We are using a coin that doesn't support multi-signature address derivation.
				// TODO: AddressService#fromMultiSignature is not implemented for Lisk.
			}

			const addresses: RecipientItem[] = [];
			for (const publicKey of publicKeys) {
				const address = await addressFromPublicKey(senderWallet, publicKey);
				assertString(address);
				addresses.push({ address });
			}

			setParticipantAddresses(addresses);
			setMinParticipants(min);
			setPublicKeys(publicKeys);
		};

		fetchData();
	}, [transaction, senderWallet]);

	return (
		<section data-testid="TransactionSuccessful" className="space-y-8">
			<StepHeader title={title || t("TRANSACTION.SUCCESS.CREATED")} />

			<Image name={banner || "TransactionSignedBanner"} domain="transaction" className="hidden w-full md:block" />

			<p className="hidden text-theme-secondary-text md:block">
				{description || t("TRANSACTION.SUCCESS.MUSIG_DESCRIPTION")}
			</p>

			<Alert variant="success" className="md:hidden">
				{t("TRANSACTION.SUCCESS.MUSIG_DESCRIPTION")}
			</Alert>

			<div>
				{senderWallet && transaction && (
					<>
						<TransactionExplorerLink
							transaction={transaction}
							border={false}
							paddingPosition="bottom"
							isDisabled
						/>

						<TransactionType transaction={transaction} />

						<TransactionNetwork network={senderWallet.network()} />

						{generatedAddress && (
							<TransactionDetail
								data-testid="TransactionSuccessful__musig-address"
								label={
									<div className="flex items-center space-x-2">
										<span>{t("TRANSACTION.MULTISIGNATURE.GENERATED_ADDRESS")}</span>{" "}
										<Icon name="Multisignature" />
									</div>
								}
								extra={
									<div className="flex items-center">
										<Avatar address={generatedAddress} size={isXs || isSm ? "xs" : "lg"} />
									</div>
								}
							>
								<div className="flex grow items-center space-x-2 text-theme-primary-300 dark:text-theme-secondary-600">
									<div className="w-0 flex-1 text-right md:text-left">
										<Address address={generatedAddress} />
									</div>
									<Clipboard variant="icon" data={generatedAddress}>
										<Icon name="Copy" />
									</Clipboard>
								</div>
							</TransactionDetail>
						)}

						{transaction.isMultiSignatureRegistration() && (
							<TransactionSender address={senderWallet.address()} network={senderWallet.network()} />
						)}

						{generatedAddress && !transaction.isMultiSignatureRegistration() && (
							<TransactionSender address={generatedAddress} network={senderWallet.network()} />
						)}

						{!transaction.isMultiSignatureRegistration() && (
							<TransactionRecipients
								label={t("TRANSACTION.RECIPIENTS_COUNT", {
									count: transaction.recipients().length,
								})}
								recipients={transaction.recipients()}
								currency={senderWallet.currency()}
							/>
						)}

						<TransactionRecipients
							label={t("TRANSACTION.MULTISIGNATURE.PARTICIPANTS_COUNT", {
								count: participantAddresses.length,
							})}
							recipients={participantAddresses}
							currency={senderWallet.currency()}
						/>

						{publicKeys?.length && (
							<TransactionDetail label={t("TRANSACTION.MULTISIGNATURE.MIN_SIGNATURES")}>
								<div className="whitespace-nowrap">
									<span>{minParticipants} </span>
									<span
										data-testid="MultiSignatureSuccessful__publicKeys"
										className="whitespace text-theme-secondary-700"
									>
										{t("TRANSACTION.MULTISIGNATURE.OUT_OF_LENGTH", {
											length: publicKeys.length,
										})}
									</span>
								</div>
							</TransactionDetail>
						)}

						{transaction.amount() > 0 && (
							<TransactionAmount
								amount={transaction.amount()}
								currency={senderWallet.currency()}
								isTotalAmount={transaction.recipients().length > 1}
								isSent={true}
							/>
						)}
					</>
				)}

				{children}
			</div>
		</section>
	);
};
