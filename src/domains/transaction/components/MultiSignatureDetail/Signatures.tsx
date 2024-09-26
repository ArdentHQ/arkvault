import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Tooltip } from "@/app/components/Tooltip";
import { useMultiSignatureStatus } from "@/domains/transaction/hooks";
import { Icon } from "@/app/components/Icon";
import { Table, TableCell, TableRow } from "@/app/components/Table";
import { TableWrapper } from "@/app/components/Table/TableWrapper";
import { Networks } from "@ardenthq/sdk";
import { AddressCopy, AddressLabel } from "@/app/components/Address";
import { useMusigParticipants } from "@/domains/transaction/hooks/use-musig-participants";

const ParticipantStatus = ({
	transaction,
	publicKey,
	wallet,
}: {
	transaction: DTO.ExtendedSignedTransactionData;
	publicKey: string;
	wallet: Contracts.IReadWriteWallet;
}) => {
	const { t } = useTranslation();
	const { isAwaitingOurFinalSignature } = useMultiSignatureStatus({ transaction, wallet });

	const isAwaitingSignature = useMemo(() => {
		try {
			if (
				transaction.isMultiSignatureRegistration() &&
				!wallet.transaction().isAwaitingOurSignature(transaction.id()) &&
				!wallet.transaction().isAwaitingOtherSignatures(transaction.id())
			) {
				return false;
			}

			if (transaction.isMultiSignatureRegistration() && isAwaitingOurFinalSignature) {
				return false;
			}

			return wallet.transaction().isAwaitingSignatureByPublicKey(transaction.id(), publicKey);
		} catch {
			return false;
		}
	}, [wallet, transaction, publicKey]);

	const status = isAwaitingSignature ? t("COMMON.AWAITING_SIGNATURE") : t("COMMON.SIGNED")

	return (
		<div data-testid="Signatures__participant-status" className="relative">
			<Tooltip content={status}>
				<div>
					{isAwaitingSignature && <Icon size="lg" name="Clock" className="text-theme-secondary-500 dark:text-theme-secondary-700" />}
					{!isAwaitingSignature && <Icon name="CircleCheckMark" size="lg" className="text-theme-primary-500" />}
				</div>
			</Tooltip>
		</div>
	);
};


const ParticipantRow = ({
	wallet,
	transaction,
}: {
	wallet: Contracts.IReadWriteWallet,
	transaction: DTO.ExtendedSignedTransactionData
}) => (
	<TableRow className="group relative max-md:!border-transparent" key={wallet.address()}>
		<TableCell
			variant="start"
			key={wallet.address()}
			innerClassName="text-sm font-semibold justify-between sm:justify-start max-sm:bg-theme-secondary-100 max-sm:dark:bg-black max-sm:m-3 max-sm:mb-0 max-sm:px-4 max-sm:py-3 max-sm:border max-sm:rounded-md max-sm:border-theme-secondary-300 max-sm:dark:border-theme-secondary-800"
		>
			<div className="flex space-x-2 w-full">
				<div className="w-full sm:w-auto">
					<AddressLabel>{wallet.address()}</AddressLabel>
				</div>

				<AddressCopy address={wallet.address()} />
			</div>

			<div className="sm:hidden pl-2 border-l ml-2 border-theme-secondary-300 dark:border-theme-secondary-800 "><ParticipantStatus transaction={transaction} wallet={transaction.wallet()} publicKey={wallet.publicKey()!} /></div>
		</TableCell>

		<TableCell
			variant="end"
			key={wallet.address()}
			innerClassName="flex justify-end max-sm:hidden"
		>
			<ParticipantStatus transaction={transaction} wallet={transaction.wallet()} publicKey={wallet.publicKey()!} />
		</TableCell>

	</TableRow>
);

export const Signatures = ({
	profile,
	publicKeys,
	transaction,
}: {
	profile: Contracts.IProfile;
	publicKeys: string[];
	transaction: DTO.ExtendedSignedTransactionData
}) => {
	const { t } = useTranslation();

	const { participants } = useMusigParticipants({ network: transaction.wallet().network(), profile, publicKeys });

	return (
		<TableWrapper>
			<Table
				columns={[
					{
						Header: t("COMMON.ADDRESS"),
						headerClassName: "max-sm:hidden",
					},
					{

						Header: t("COMMON.STATUS"),
						headerClassName: "max-sm:hidden text-right",
					}
				]}
				data={participants}
			>
				{(wallet) => <ParticipantRow key={wallet.address()} wallet={wallet} transaction={transaction} />}
			</Table>
		</TableWrapper>
	);
};
