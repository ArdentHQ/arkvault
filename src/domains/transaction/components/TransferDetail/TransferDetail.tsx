import React from "react";
import { useTranslation } from "react-i18next";

import { Modal } from "@/app/components/Modal";
import {
	TransactionAddresses,
	TransactionType,
	TransactionSummary,
	TransactionDetails,
} from "@/domains/transaction/components/TransactionDetail";
import { TransactionId } from "@/domains/transaction/components/TransactionDetail/TransactionId";

import { TransactionDetailProperties } from "@/domains/transaction/components/TransactionDetailModal/TransactionDetailModal.contracts";
import { DetailWrapper } from "@/app/components/DetailWrapper";
import { TransactionDetailPadded } from "@/domains/transaction/components/TransactionSuccessful";

export const TransferDetail = ({ isOpen, aliases, transaction, onClose, profile }: TransactionDetailProperties) => {
	const { t } = useTranslation();

	return (
		<Modal title={t("TRANSACTION.MODAL_TRANSFER_DETAIL.TITLE")} isOpen={isOpen} onClose={onClose} noButtons>
			<div className="mt-4">
				<TransactionId transaction={transaction} />
			</div>

			<div className="mt-6 space-y-8">
				<TransactionDetailPadded>
					<TransactionAddresses
						profile={profile}
						senderAddress={transaction.sender()}
						network={transaction.wallet().network()}
						recipients={[
							{
								address: transaction.recipient(),
								alias: aliases?.recipients[0].alias,
								isDelegate: aliases?.recipients[0].isDelegate,
							},
						]}
					/>
				</TransactionDetailPadded>

				<TransactionDetailPadded>
					<TransactionType transaction={transaction} />
				</TransactionDetailPadded>

				<TransactionDetailPadded>
					<TransactionSummary transaction={transaction} senderWallet={transaction.wallet()} />
				</TransactionDetailPadded>

				<TransactionDetailPadded>
					<TransactionDetails transaction={transaction} />
				</TransactionDetailPadded>

				<TransactionDetailPadded>
					<DetailWrapper label={t("COMMON.MEMO_SMARTBRIDGE")}>
						<p>{transaction.memo() ?? t("COMMON.NOT_AVAILABLE")}</p>
					</DetailWrapper>
				</TransactionDetailPadded>
			</div>
		</Modal>
	);
};

TransferDetail.displayName = "TransferDetail";
