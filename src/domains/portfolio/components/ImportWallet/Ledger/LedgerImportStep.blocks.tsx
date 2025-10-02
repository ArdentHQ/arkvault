import React, { useCallback, useMemo } from "react";
import { Networks } from "@/app/lib/mainsail";
import { Contracts } from "@/app/lib/profiles";
import { useTranslation } from "react-i18next";
import { Address } from "@/app/components/Address";
import { Amount } from "@/app/components/Amount";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { LedgerData } from "@/app/contexts/Ledger";
import { assertWallet } from "@/utils/assertions";
import { useBreakpoint } from "@/app/hooks";
import { AmountWrapper } from "./LedgerScanStep.blocks";
import { MobileCard } from "@/app/components/Table/Mobile/MobileCard";
import { MobileSection } from "@/app/components/Table/Mobile/MobileSection";
import { Column } from "react-table";
import { Table, TableCell, TableRow } from "@/app/components/Table";
import { TableWrapper } from "@/app/components/Table/TableWrapper";

export const SectionHeaderMobile = ({ title }: { title: string }) => (
	<div
		className="border-l-theme-primary-400 bg-theme-primary-100 dark:border-l-theme-primary-300 dark:bg-theme-secondary-800 dim:border-l-theme-dim-navy-400 dim:bg-theme-dim-950 flex h-9 w-full flex-row items-center justify-between border-l-2 px-3"
		data-testid="SectionHeaderMobile__wrapper"
	>
		<span className="text-theme-secondary-700 dark:text-theme-secondary-500 dim:text-theme-dim-500 text-base font-semibold">
			{title}
		</span>
	</div>
);

export const SectionBodyItem = ({ title, children }: { title: string; children: React.ReactNode }) => (
	<div
		className="flex w-full flex-row items-center justify-between text-sm font-semibold sm:justify-start sm:gap-3 sm:text-base"
		data-testid="SectionBodyItem__wrapper"
	>
		<span className="text-theme-secondary-700 dark:text-theme-secondary-500 dim:text-theme-dim-500 sm:w-[90px]">
			{title}
		</span>
		<div className="text-theme-secondary-900 dark:text-theme-secondary-200 dim:text-theme-dim-200 sm:w-full">
			{children}
		</div>
	</div>
);

const EditButton = ({ onClick }: { onClick: () => void }) => {
	const { t } = useTranslation();

	return (
		<Button
			variant="transparent"
			onClick={onClick}
			className="text-theme-primary-600 dark:text-theme-secondary-500 dim:text-theme-dim-500 p-0!"
			data-testid="LedgerImportStep__edit-alias"
		>
			<Icon name="Pencil" />
			<span>{t("COMMON.EDIT")}</span>
		</Button>
	);
};

const DesktopImportSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
	<div className="flex flex-col gap-4" data-tesid="DesktopImportSection__wrapper">
		<div className="flex flex-col gap-2">
			<span className="text-theme-secondary-700 text-base font-semibold">{title}</span>
			<div className="border-theme-secondary-300 dark:border-theme-secondary-800 dim:border-theme-dim-700 flex flex-col gap-4 rounded-xl border px-6 py-5">
				{children}
			</div>
		</div>
	</div>
);

export const SingleImport = ({
	network,
	onClickEditWalletName,
	profile,
	wallets,
}: {
	network: Networks.Network;
	onClickEditWalletName: (wallet: Contracts.IReadWriteWallet) => void;
	profile: Contracts.IProfile;
	wallets: LedgerData[];
}) => {
	const { t } = useTranslation();
	const { isXs } = useBreakpoint();

	const ledgerWallet = wallets[0];

	const wallet = profile.wallets().findByAddressWithNetwork(ledgerWallet.address, network.id());
	assertWallet(wallet);

	if (isXs) {
		return (
			<div className="flex flex-col gap-6" data-testid="SingleImport__container-mobile">
				<div>
					<SectionHeaderMobile title={t("COMMON.IMPORTED")} />
					<div className="flex flex-col gap-3 px-3 pt-3">
						<SectionBodyItem title={t("COMMON.ADDRESS")}>
							<div className="w-32">
								<Address address={ledgerWallet.address} showCopyButton wrapperClass="justify-between" />
							</div>
						</SectionBodyItem>

						<SectionBodyItem title={t("COMMON.BALANCE")}>
							<Amount value={ledgerWallet.balance ?? 0} ticker={network.ticker()} />
						</SectionBodyItem>
					</div>
				</div>

				<div>
					<SectionHeaderMobile title={t("COMMON.ADDRESS_NAME")} />
					<div className="flex flex-col gap-3 px-3 pt-3">
						<SectionBodyItem title={t("COMMON.NAME")}>
							<div className="flex flex-row items-center gap-2">
								{wallet.alias()}
								<hr className="bg-theme-secondary-300 dark:bg-theme-secondary-800 dim:bg-theme-dim-700 h-5 w-px border-transparent" />
								<EditButton onClick={() => onClickEditWalletName(wallet)} />
							</div>
						</SectionBodyItem>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4" data-testid="SingleImport__container">
			<DesktopImportSection title={t("COMMON.IMPORTED")}>
				<SectionBodyItem title={t("COMMON.ADDRESS")}>
					<Address address={ledgerWallet.address} showCopyButton truncateOnTable />
				</SectionBodyItem>

				<hr className="border-theme-secondary-300 dark:border-theme-secondary-800 dim:border-theme-dim-700 w-full border border-dashed" />

				<SectionBodyItem title={t("COMMON.BALANCE")}>
					<Amount value={ledgerWallet.balance ?? 0} ticker={network.ticker()} />
				</SectionBodyItem>
			</DesktopImportSection>

			<DesktopImportSection title={t("COMMON.ADDRESS_NAME")}>
				<SectionBodyItem title={t("COMMON.NAME")}>
					<div className="flex w-full flex-row items-center justify-between">
						<span>{wallet.alias()}</span>

						<EditButton onClick={() => onClickEditWalletName(wallet)} />
					</div>
				</SectionBodyItem>
			</DesktopImportSection>
		</div>
	);
};

export const ImportedLedgerMobileItem = ({
	address,
	balance,
	coin,
	name,
	onClick,
}: {
	address: string;
	balance?: number;
	coin: string;
	name: string;
	onClick: () => void;
}) => {
	const { t } = useTranslation();

	return (
		<MobileCard data-testid="LedgerMobileItem__wrapper">
			<div className="bg-theme-secondary-100 dim:bg-theme-dim-950 flex h-11 w-full items-center justify-between px-4 dark:bg-black">
				<span className="text-theme-secondary-700 dark:text-theme-secondary-500 dim:text-theme-dim-500 text-sm font-semibold">
					{name}
				</span>

				<EditButton onClick={onClick} />
			</div>

			<div className="flex w-full flex-col gap-4 px-4 pt-2.5 pb-4">
				<MobileSection title={t("COMMON.ADDRESS")}>
					<Address
						address={address}
						showCopyButton
						addressClass="text-theme-secondary-900 text-sm font-semibold dark:text-theme-secondary-200 dim:text-theme-dim-50"
					/>
				</MobileSection>
				<MobileSection title={`${t("COMMON.VALUE")} (${coin})`} data-testid="LedgerMobileItem__network">
					<AmountWrapper isLoading={false}>
						<Amount value={balance!} ticker={coin} />
					</AmountWrapper>
				</MobileSection>
			</div>
		</MobileCard>
	);
};

export const MultipleImport = ({
	network,
	onClickEditWalletName,
	profile,
	wallets,
}: {
	network: Networks.Network;
	onClickEditWalletName: (wallet: Contracts.IReadWriteWallet) => void;
	profile: Contracts.IProfile;
	wallets: LedgerData[];
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
					<TableCell variant="start" innerClassName="justify-center">
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
									className="text-theme-secondary-700 dark:text-theme-secondary-500 dim:text-theme-dim-500 text-sm font-semibold"
								/>
							</AmountWrapper>
						</div>
					</TableCell>

					<TableCell variant="end" innerClassName="justify-end font-semibold">
						<Button
							variant="secondary"
							onClick={() => onClickEditWalletName(importedWallet)}
							data-testid="LedgerImportStep__edit-alias"
							className="my-2.5 p-4"
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
