import React from "react";
import { Table, TableCell, TableRow } from "@/app/components/Table";
import { TableWrapper } from "@/app/components/Table/TableWrapper";
import { Contracts } from "@ardenthq/sdk-profiles";
import { Networks } from "@ardenthq/sdk";
import { useTranslation } from "react-i18next";

import { AddressCopy, AddressLabel, AddressLink } from "@/app/components/Address";
import { useMusigParticipants } from "@/domains/transaction/hooks/use-musig-participants";

export const TransactionMusigParticipants = ({
	useExplorerLinks,
	profile,
	publicKeys,
	network,
}: {
	useExplorerLinks?: boolean;
	profile: Contracts.IProfile;
	network: Networks.Network;
	publicKeys: string[];
}) => {
	const { t } = useTranslation();

	const { participants } = useMusigParticipants({ network, profile, publicKeys });

	const renderRow = (wallet: Contracts.IReadWriteWallet) => (
		<TableRow className="group relative max-md:!border-transparent" key={wallet.address()}>
			<TableCell
				variant="start"
				key={wallet.address()}
				innerClassName="space-x-2 text-sm font-semibold justify-between sm:justify-start max-sm:bg-theme-secondary-100 max-sm:dark:bg-black max-sm:m-3 max-sm:mb-0 max-sm:px-4 max-sm:py-3 max-sm:border max-sm:rounded-md max-sm:border-theme-secondary-300 max-sm:dark:border-theme-secondary-800"
			>
				{useExplorerLinks && (
					<>
						<div className="w-3/5 sm:w-auto">
							<AddressLink explorerLink={wallet.explorerLink()}>{wallet.address()}</AddressLink>
						</div>
					</>
				)}

				{!useExplorerLinks && (
					<>
						<div className="w-3/5 sm:w-auto">
							<AddressLabel>{wallet.address()}</AddressLabel>
						</div>
					</>
				)}

				<AddressCopy address={wallet.address()} />
			</TableCell>
		</TableRow>
	);

	return (
		<TableWrapper className="sm:border-none">
			<Table
				columns={[
					{
						Header: t("COMMON.ADDRESS"),
						headerClassName: "hidden sm:block",
					},
				]}
				data={participants}
			>
				{renderRow}
			</Table>
		</TableWrapper>
	);
};
