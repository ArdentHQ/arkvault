import { Enums } from "@ardenthq/sdk";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Modal } from "@/app/components/Modal";
import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";
import {
	TransactionDetail,
	TransactionExplorerLink,
	TransactionFee,
	TransactionSender,
	TransactionStatus,
	TransactionTimestamp,
} from "@/domains/transaction/components/TransactionDetail";
import { TransactionDetailProperties } from "@/domains/transaction/components/TransactionDetailModal/TransactionDetailModal.contracts";
import { useBreakpoint } from "@/app/hooks";
import { Address } from "@/app/components/Address";
import { Avatar } from "@/app/components/Avatar";
import { TransactionDetailAddressList } from "@/domains/transaction/components/MultiSignatureDetail/components/TransactionDetailAddressList";
import { RecipientList } from "@/domains/transaction/components/RecipientList";
import { MdAndAbove, SmAndBelow } from "@/app/components/Breakpoint";

export const MultiSignatureRegistrationDetail: React.FC<TransactionDetailProperties> = ({
	isOpen,
	transaction,
	onClose,
}: TransactionDetailProperties) => {
	const { t } = useTranslation();

	const wallet = transaction.wallet();
	const [participants, setParticipants] = useState<RecipientItem[]>([]);
	const [generatedAddress, setGeneratedAddress] = useState<string>();
	const { isXs, isSm } = useBreakpoint();

	useEffect(() => {
		const fetchData = async () => {
			const addresses: RecipientItem[] = [];
			for (const publicKey of transaction.publicKeys()) {
				const { address } = await wallet.coin().address().fromPublicKey(publicKey);
				addresses.push({ address });
			}

			setParticipants(addresses);

			if (!wallet.network().allows(Enums.FeatureFlag.AddressMultiSignature)) {
				setGeneratedAddress(transaction.sender());
				return;
			}

			const { address } = await wallet
				.coin()
				.address()
				.fromMultiSignature({ min: transaction.min(), publicKeys: transaction.publicKeys() });

			setGeneratedAddress(address);
		};

		fetchData();
	}, [wallet, transaction]);

	return (
		<Modal
			title={t("TRANSACTION.MODAL_MULTISIGNATURE_DETAIL.STEP_1.TITLE")}
			isOpen={isOpen}
			onClose={onClose}
			noButtons
		>
			<TransactionSender address={transaction.sender()} network={transaction.wallet().network()} border={false} />

			<TransactionFee currency={wallet.currency()} value={transaction.fee()} />

			<TransactionTimestamp timestamp={transaction.timestamp()} />

			<TransactionStatus transaction={transaction} />

			<SmAndBelow>
				<TransactionDetailAddressList
					label={t("TRANSACTION.MULTISIGNATURE.PARTICIPANTS_COUNT", { count: participants.length })}
					transaction={transaction}
					addresses={participants}
				/>
			</SmAndBelow>

			<MdAndAbove>
				<TransactionDetail label={t("TRANSACTION.MULTISIGNATURE.PARTICIPANTS")} paddingPosition="top">
					<RecipientList
						isEditable={false}
						recipients={participants}
						showAmount={false}
						showExchangeAmount={false}
						ticker={wallet.currency()}
						variant="condensed"
					/>
				</TransactionDetail>
			</MdAndAbove>

			<TransactionDetail label={t("TRANSACTION.MULTISIGNATURE.MIN_SIGNATURES")}>
				{transaction.min()} / {transaction.publicKeys().length}
			</TransactionDetail>

			{generatedAddress && (
				<TransactionDetail
					label={t("TRANSACTION.MULTISIGNATURE.GENERATED_ADDRESS")}
					extra={<Avatar address={generatedAddress} size={isXs || isSm ? "xs" : "lg"} />}
				>
					<div className="w-0 flex-1 text-right md:text-left">
						<Address address={generatedAddress} alignment={isXs || isSm ? "right" : undefined} />
					</div>
				</TransactionDetail>
			)}

			<TransactionExplorerLink transaction={transaction} />
		</Modal>
	);
};

MultiSignatureRegistrationDetail.displayName = "MultiSignatureRegistrationDetail";
