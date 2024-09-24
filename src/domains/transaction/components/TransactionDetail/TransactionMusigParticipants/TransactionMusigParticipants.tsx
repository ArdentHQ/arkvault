import React, { useEffect, useState } from "react";
import { Table, TableCell, TableRow } from "@/app/components/Table";
import { TableWrapper } from "@/app/components/Table/TableWrapper";
import { Contracts } from "@ardenthq/sdk-profiles";
import { DTO } from "@ardenthq/sdk";
import { useTranslation } from "react-i18next";

import { getMusigParticipantWallets } from "@/domains/transaction/components/MultiSignatureDetail/MultiSignatureDetail.helpers";
import { AddressLink } from "@/app/components/Address";

export const TransactionMusigParticipants = ({
	transaction,
	profile,
}: {
	profile: Contracts.IProfile;
	transaction: DTO.RawTransactionData;
}) => {
	const { t } = useTranslation();
	const [participantWallets, setParticipantWallets] = useState<Contracts.IReadWriteWallet[]>([]);

	useEffect(() => {
		const constructParticipantWallets = async () => {
			const wallets = await getMusigParticipantWallets(profile, transaction);
			setParticipantWallets(wallets);
		};

		constructParticipantWallets();
	}, [transaction]);

	const renderRow = (wallet: Contracts.IReadWriteWallet) => (
		<TableRow className="group relative" key={wallet.address()}>
			<TableCell variant="start" key={wallet.address()}>
				<AddressLink explorerLink={wallet.explorerLink()} address={wallet.address()} />
			</TableCell>
		</TableRow>
	);

	return (
		<TableWrapper>
			<Table
				columns={[
					{
						Header: t("COMMON.ADDRESS"),
						headerClassName: "hidden sm:block",
					},
				]}
				data={participantWallets}
			>
				{renderRow}
			</Table>
		</TableWrapper>
	);
};
