import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useCallback, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Address } from "@/app/components/Address";
import { Amount } from "@/app/components/Amount";
import { Button } from "@/app/components/Button";
import { Header } from "@/app/components/Header";
import { Icon } from "@/app/components/Icon";
import { LedgerData } from "@/app/contexts/Ledger";
import { assertNetwork, assertWallet } from "@/utils/assertions";
import { useBreakpoint } from "@/app/hooks";
import { ImportedLedgerMobileItem, SectionHeaderMobile, SingleImport } from "./LedgerImportStep.blocks";
import { Table, TableCell, TableRow } from "@/app/components/Table";
import { Column } from "react-table";
import { AmountWrapper } from "./LedgerScanStep.blocks";
import { TableWrapper } from "@/app/components/Table/TableWrapper";

const MultipleImport = ({
	network,
	onClickEditWalletName,
	profile,
	wallets,
	isCompact,
}: {
	network: Networks.Network;
	onClickEditWalletName: (wallet: Contracts.IReadWriteWallet) => void;
	profile: Contracts.IProfile;
	wallets: LedgerData[];
	isCompact: boolean;
}) => {
	const { t } = useTranslation();
	const { isXs } = useBreakpoint();

	const columns = useMemo<Column<LedgerData>[]>(
		() => [
			{
				Header: t("COMMON.ADDRESS"),
				accessor: "address",
				headerClassName: "no-border",
			},
			{
				Header: t("COMMON.EDIT_item", { item: t("COMMON.NAME") }),
				accessor: "balance",
				className: "justify-end",
				headerClassName: "no-border",
			},
		],
		[t],
	);

	const data = useMemo(() => wallets, [wallets]);

	const renderTableRow = useCallback(
		(wallet: LedgerData) => {
			const importedWallet = profile.wallets().findByAddressWithNetwork(wallet.address, network.id());
			assertWallet(importedWallet);

			return (
				<TableRow className="relative">
					<TableCell variant="start" innerClassName="justify-center" isCompact={isCompact}>
						<div className="flex flex-1 flex-col py-2">
							<Address
								walletName={importedWallet.alias()}
								address={wallet.address}
								showCopyButton
								truncateOnTable
							/>
							<AmountWrapper isLoading={false}>
								<Amount
									value={wallet.balance ?? 0}
									ticker={network.ticker()}
									className="text-sm font-semibold text-theme-secondary-700 dark:text-theme-secondary-500"
								/>
							</AmountWrapper>
						</div>
					</TableCell>

					<TableCell variant="end" innerClassName="justify-end font-semibold" isCompact={isCompact}>
						<Button
							variant="secondary"
							onClick={() => onClickEditWalletName(importedWallet)}
							data-testid="LedgerImportStep__edit-alias"
						>
							<Icon name="Pencil" dimensions={[14, 14]} />
						</Button>
					</TableCell>
				</TableRow>
			);
		},
		[network],
	);

	return (
		<div>
			<div className="mb-3 sm:hidden">
				<SectionHeaderMobile title={t("COMMON.ADDRESSES")} />
			</div>

			{isXs ? (
				<div className="flex flex-col gap-2">
					{wallets.map((wallet) => {
						const importedWallet = profile.wallets().findByAddressWithNetwork(wallet.address, network.id());
						assertWallet(importedWallet);

						return (
							<ImportedLedgerMobileItem
								key={wallet.address}
								name={importedWallet.alias() ?? ""}
								address={wallet.address}
								balance={wallet.balance}
								coin={network.ticker()}
								onClick={() => onClickEditWalletName(importedWallet)}
							/>
						);
					})}
				</div>
			) : (
				<TableWrapper className="md:border-b-0">
					<Table columns={columns} data={data} className="with-x-padding">
						{renderTableRow}
					</Table>
				</TableWrapper>
			)}
		</div>
	);
};

export const LedgerImportStep = ({
	onClickEditWalletName,
	profile,
	wallets,
}: {
	wallets: LedgerData[];
	profile: Contracts.IProfile;
	onClickEditWalletName: (wallet: Contracts.IReadWriteWallet) => void;
}) => {
	const { t } = useTranslation();

	const { isLgAndAbove } = useBreakpoint();

	const isCompact = useMemo<boolean>(
		() => !isLgAndAbove || !profile.appearance().get("useExpandedTables"),
		[isLgAndAbove, profile],
	);

	const { watch } = useFormContext();

	const [network] = useState(() => watch("network"));
	assertNetwork(network);

	return (
		<section data-testid="LedgerImportStep">
			<Header
				title={t("WALLETS.PAGE_IMPORT_WALLET.LEDGER_IMPORT_STEP.TITLE")}
				subtitle={t("WALLETS.PAGE_IMPORT_WALLET.LEDGER_IMPORT_STEP.SUBTITLE", { count: wallets.length })}
				titleIcon={
					<Icon
						name="DoubleCheckedCircle"
						className="text-theme-success-100 dark:text-theme-success-900"
						dimensions={[22, 22]}
					/>
				}
				className="mb-4 hidden sm:block"
			/>

			{wallets.length > 1 ? (
				<MultipleImport
					wallets={wallets}
					profile={profile}
					network={network}
					onClickEditWalletName={onClickEditWalletName}
					isCompact={isCompact}
				/>
			) : (
				<SingleImport
					wallets={wallets}
					profile={profile}
					network={network}
					onClickEditWalletName={onClickEditWalletName}
				/>
			)}
		</section>
	);
};
