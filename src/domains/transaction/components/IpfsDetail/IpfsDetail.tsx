import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Address } from "@/app/components/Address";
import { Modal } from "@/app/components/Modal";
import {
	TransactionDetail,
	TransactionExplorerLink,
	TransactionFee,
	TransactionSender,
	TransactionStatus,
	TransactionTimestamp,
} from "@/domains/transaction/components/TransactionDetail";
import { TransactionDetailProperties } from "@/domains/transaction/components/TransactionDetailModal/TransactionDetailModal.contracts";
import { TransactionIpfsIcon } from "@/domains/transaction/components/TransactionDetail/TransactionIpfsIcon";

export const IpfsDetail = ({ isOpen, transaction, onClose }: TransactionDetailProperties) => {
	const { t } = useTranslation();

	const wallet = useMemo(() => transaction.wallet(), [transaction]);

	return (
		<Modal title={t("TRANSACTION.MODAL_IPFS_DETAIL.TITLE")} isOpen={isOpen} onClose={onClose} noButtons>
			<TransactionSender address={transaction.sender()} network={transaction.wallet().network()} border={false} />

			<TransactionFee currency={wallet.currency()} value={transaction.fee()} />

			<TransactionDetail label={t("TRANSACTION.IPFS_HASH")} extra={<TransactionIpfsIcon />}>
				<div className="block w-0 flex-1 text-right md:hidden md:text-left">
					<Address alignment="right" address={transaction.hash()} addressClass="font-normal" />
				</div>
				<div className="hidden md:block">{transaction.hash()}</div>
			</TransactionDetail>

			<TransactionTimestamp timestamp={transaction.timestamp()} />

			<TransactionStatus transaction={transaction} />

			<TransactionExplorerLink transaction={transaction} />
		</Modal>
	);
};

IpfsDetail.displayName = "IpfsDetail";
