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
	TransactionAddresses,
	TransactionSummary,
	TransactionDetails,
	TransactionMusigParticipants,
} from "@/domains/transaction/components/TransactionDetail";
import { ExtendedSignedTransactionData } from "@/domains/transaction/pages/SendRegistration/SendRegistration.contracts";
import { assertString } from "@/utils/assertions";
import { StepHeader } from "@/app/components/StepHeader";
import { useBreakpoint } from "@/app/hooks";
import { TransactionId } from "../TransactionDetail/TransactionId";
import { DetailLabel, DetailPadded, DetailWrapper } from "@/app/components/DetailWrapper";
import { useTransactionRecipients } from "../../hooks/use-transaction-recipients";
import cn from "classnames";
import { VoteTransactionType } from "../VoteTransactionType";

interface TransactionSuccessfulProperties {
	children?: React.ReactNode;
	transaction: ExtendedSignedTransactionData;
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

	const isVoteTransaction = [transaction.isVote(), transaction.isVoteCombination(), transaction.isUnvote()].some(
		Boolean,
	);
	// const { votes, unvotes } = useTransactionRecipients({
	// 	network: transaction.wallet().network(),
	// 	profile: senderWallet.profile(),
	// 	transaction,
	// });
	const votes = []
	const unvotes = []
	// const { recipients } = useTransactionRecipients({ profile: senderWallet.profile(), transaction });

	const labelClassName = cn({
		"min-w-24": !transaction.isVoteCombination(),
		"min-w-32": transaction.isVoteCombination(),
	});


	return (
		<section data-testid="TransactionSuccessful" className="space-y-8">
			<StepHeader
				title={t("TRANSACTION.SUCCESS.CREATED")}
				titleIcon={
					<Icon
						dimensions={[24, 24]}
						name="PendingTransaction"
						data-testid="icon-PendingTransaction"
						className="text-theme-primary-600"
					/>
				}
			/>

			<div className="mt-4">
				<TransactionId transaction={transaction} />
			</div>

			<div className="mt-6 space-y-4">
				<DetailPadded>
					<TransactionAddresses
						explorerLink={transaction.explorerLink()}
						profile={senderWallet.profile()}
						senderAddress={transaction.sender()}
						network={transaction.wallet().network()}
						recipients={[]}
						labelClassName={labelClassName}
					/>
				</DetailPadded>

				<DetailPadded>
					{!isVoteTransaction && <TransactionType transaction={transaction} />}
					{isVoteTransaction && <VoteTransactionType votes={votes} unvotes={unvotes} />}
				</DetailPadded>

				<DetailPadded>
					<TransactionSummary
						labelClassName={labelClassName}
						transaction={transaction}
						senderWallet={transaction.wallet()}
					/>
				</DetailPadded>

				<DetailPadded>
					<TransactionDetails transaction={transaction} labelClassName={labelClassName} />
				</DetailPadded>

				{[!!transaction.memo(), transaction.isMultiPayment(), transaction.isTransfer()].some(Boolean) && (
					<DetailPadded>
						<DetailWrapper label={t("COMMON.MEMO_SMARTBRIDGE")}>
							{transaction.memo() && <p>{transaction.memo()}</p>}
							{!transaction.memo() && (
								<p className="text-theme-secondary-500">{t("COMMON.NOT_AVAILABLE")}</p>
							)}
						</DetailWrapper>
					</DetailPadded>
				)}

				{transaction.isMultiSignatureRegistration() && (
					<DetailPadded>
						<DetailLabel>{t("TRANSACTION.PARTICIPANTS")}</DetailLabel>
						<div className="mt-2">
							<TransactionMusigParticipants transaction={transaction} profile={senderWallet.profile()} />
						</div>
					</DetailPadded>
				)}
			</div>
		</section>
	);
};
