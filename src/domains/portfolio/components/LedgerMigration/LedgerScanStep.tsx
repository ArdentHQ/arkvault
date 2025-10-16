import { Networks, Contracts, ConfigKey } from "@/app/lib/mainsail";
import { Contracts as ProfilesContracts } from "@/app/lib/profiles";
import Tippy from "@tippyjs/react";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Column } from "react-table";
import { BIP44 } from "@ardenthq/arkvault-crypto";
import { toasts } from "@/app/services";
import { Address } from "@/app/components/Address";
import { Alert } from "@/app/components/Alert";
import { Amount } from "@/app/components/Amount";
import { Checkbox } from "@/app/components/Checkbox";
import { Skeleton } from "@/app/components/Skeleton";
import { Table, TableCell, TableRow } from "@/app/components/Table";
import { useLedgerContext } from "@/app/contexts";
import { LedgerData, useLedgerScanner } from "@/app/contexts/Ledger";
import { Button } from "@/app/components/Button";
import cn from "classnames";
import { LedgerTableProperties } from "@/domains/portfolio/components/ImportWallet/Ledger/LedgerTabs.contracts";
import {
	AmountWrapper,
	AddressTableLoaderOverlay,
	AddressMobileItem,
} from "@/domains/portfolio/components/ImportWallet/Ledger/LedgerScanStep.blocks";
import { LedgerCancelling } from "@/domains/portfolio/components/ImportWallet/Ledger/LedgerCancelling";

export const LedgerTable: FC<LedgerTableProperties> = ({
	network,
	wallets,
	selectedWallets,
	toggleSelect,
	toggleSelectAll,
	isScanning,
	isScanningMore,
	isSelected,
	scanMore,
	pageSize,
}) => {
	const [showAll, setShowAll] = useState<boolean>(false);
	const { t } = useTranslation();

	const isAllSelected = !isScanning && wallets.length > 0 && selectedWallets.length === wallets.length;

	const columns = useMemo<Column<LedgerData>[]>(
		() => [
			{
				Header: (
					<Tippy content={isAllSelected ? t("COMMON.UNSELECT_ALL") : t("COMMON.SELECT_ALL")}>
						<Checkbox
							disabled={isScanning}
							data-testid="LedgerScanStep__select-all"
							onChange={() => toggleSelectAll()}
							checked={isAllSelected}
						/>
					</Tippy>
				),
				className: "justify-center",
				id: "select",
				minimumWidth: true,
			},
			{
				Header: t("COMMON.ADDRESS"),
				accessor: "address",
				headerClassName: "no-border",
			},
			{
				Header: t("COMMON.BALANCE"),
				accessor: "balance",
				className: "justify-end",
				headerClassName: "no-border",
			},
		],
		[t, isAllSelected, isScanning, toggleSelectAll],
	);

	const { isBusy } = useLedgerContext();

	/* istanbul ignore next -- @preserve */
	const showSkeleton = (isScanning || (isBusy && wallets.length === 0)) && !isScanningMore;

	const length = pageSize ?? 5;

	const data = useMemo(() => {
		const skeletonRows = Array.from<LedgerData>({ length }).fill({} as LedgerData);
		return showSkeleton ? skeletonRows : wallets;
	}, [wallets, showSkeleton]);

	const renderTableRow = useCallback(
		(wallet: LedgerData) => {
			if (showSkeleton) {
				return (
					<TableRow className="relative">
						<TableCell variant="start">
							<Skeleton height={20} width={20} />
						</TableCell>

						<TableCell className="w-2/5" innerClassName="space-x-4">
							<Skeleton circle height={20} width={20} />
							<Skeleton height={16} width={120} />
						</TableCell>

						<TableCell variant="end" innerClassName="justify-end">
							<AmountWrapper isLoading={true} />
						</TableCell>
					</TableRow>
				);
			}

			return (
				<TableRow isSelected={isSelected(wallet.path)} className="relative">
					<TableCell variant="start" innerClassName="justify-center">
						<Checkbox
							checked={isSelected(wallet.path)}
							onChange={() => toggleSelect(wallet.path)}
							data-testid="LedgerScanStep__checkbox-row"
						/>
					</TableCell>

					<TableCell className="w-2/5" innerClassName="space-x-4">
						<div className="flex w-32 flex-1">
							<Address address={wallet.address} showCopyButton />
						</div>
						<span className="hidden">{wallet.path}</span>
					</TableCell>

					<TableCell variant="end" innerClassName="justify-end font-semibold">
						<AmountWrapper isLoading={false}>
							<Amount value={wallet.balance!} ticker={network.ticker()} />
						</AmountWrapper>
					</TableCell>
				</TableRow>
			);
		},
		[toggleSelect, showSkeleton, isSelected, network],
	);

	const showMore = useCallback(() => {
		setShowAll(true);
	}, [setShowAll]);

	return (
		<div>
			<div className="md:border-theme-secondary-300 dark:md:border-theme-secondary-800 dim:md:border-theme-dim-700 relative hidden rounded-xl border border-transparent sm:block">
				<div>
					<Table columns={columns} data={showAll ? data : data.slice(0, 6)} className="with-x-padding">
						{renderTableRow}
					</Table>
				</div>

				{!showSkeleton && (
					<div className="flex flex-col gap-3 px-6 pb-4">
						<Button
							data-testid="LedgerScanStep__scan-more"
							isLoading={isScanningMore}
							disabled={isScanningMore}
							variant={isScanningMore ? "primary" : "secondary"}
							icon="Plus"
							iconPosition="left"
							className="w-full"
							onClick={scanMore}
						>
							<span className="pl-1">
								<Trans i18nKey="WALLETS.PAGE_IMPORT_WALLET.LEDGER_SCAN_STEP.ADD_NEW_ADDRESS" />
							</span>
						</Button>

						{data.length > 6 && !showAll && (
							<Button
								data-testid="LedgerScanStep__load-more"
								isLoading={isScanningMore}
								disabled={isScanningMore}
								variant={isScanningMore ? "primary" : "secondary"}
								className="w-full"
								onClick={showMore}
							>
								<Trans
									i18nKey="WALLETS.PAGE_IMPORT_WALLET.LEDGER_SCAN_STEP.SHOW_ALL"
									count={data.length}
								/>
							</Button>
						)}
					</div>
				)}

				{isScanning && (
					<AddressTableLoaderOverlay className="rounded-xl">
						<Trans
							i18nKey="WALLETS.PAGE_IMPORT_WALLET.LEDGER_SCAN_STEP.LOADING_ADDRESSES"
							values={{ count: length }}
						/>
					</AddressTableLoaderOverlay>
				)}
			</div>

			<div className="sm:hidden">
				<div className="border-l-theme-primary-400 bg-theme-primary-100 dark:border-l-theme-primary-300 dark:bg-theme-secondary-800 dim:border-l-theme-dim-navy-400 dim:bg-theme-dim-950 mb-3 flex h-9 w-full flex-row items-center justify-between border-l-2 px-3">
					<span className="text-theme-secondary-700 dark:text-theme-secondary-500 dim:text-theme-dim-200 text-base font-semibold">
						{t("COMMON.ADDRESS")}
					</span>
					<label
						className={cn("flex flex-row items-center gap-2", {
							"text-theme-secondary-500 dark:text-theme-secondary-700 dim:text-theme-dim-700": isScanning,
							"text-theme-secondary-700 dark:text-theme-secondary-500 dim:text-theme-dim-500":
								!isScanning,
						})}
					>
						<Checkbox
							disabled={isScanning}
							data-testid="LedgerScanStep__select-all-mobile"
							onChange={() => toggleSelectAll()}
							checked={isAllSelected}
						/>
						<span>{t("COMMON.SELECT_ALL")}</span>
					</label>
				</div>

				<div className="flex flex-col gap-2 px-1">
					{!showSkeleton &&
						data.map((wallet) => (
							<AddressMobileItem
								key={wallet.path}
								isLoading={showSkeleton}
								address={wallet.address}
								balance={wallet.balance}
								coin={network.ticker()}
								handleClick={() => toggleSelect(wallet.path)}
								isSelected={isSelected(wallet.path)}
							/>
						))}

					{showSkeleton &&
						Array.from({ length: 4 }).map((_, index) => (
							<AddressMobileItem
								index={index}
								key={index}
								isLoading
								address=""
								coin=""
								handleClick={() => {}}
								isSelected={false}
							/>
						))}

					<Button
						data-testid="LedgerScanStep__scan-more-mobile"
						isLoading={isScanningMore}
						disabled={isScanningMore}
						variant={isScanningMore ? "primary" : "secondary"}
						icon="Plus"
						iconPosition="left"
						className="w-full"
						onClick={scanMore}
					>
						<span className="pl-1">
							<Trans i18nKey="WALLETS.PAGE_IMPORT_WALLET.LEDGER_SCAN_STEP.ADD_NEW_ADDRESS" />
						</span>
					</Button>
				</div>
			</div>
		</div>
	);
};

export const showLoadedLedgerWalletsMessage = (wallets: Contracts.WalletData[]) => {
	if (wallets.length === 1) {
		return <Trans i18nKey="WALLETS.PAGE_IMPORT_WALLET.LEDGER_SCAN_STEP.LOADED_SINGLE_ADDRESS" />;
	}

	return (
		<Trans
			i18nKey="WALLETS.PAGE_IMPORT_WALLET.LEDGER_SCAN_STEP.LOADED_ADDRESSES"
			values={{ count: wallets.length }}
		/>
	);
};

export const LedgerScanStep = ({
	network,
	setRetryFn,
	profile,
	isCancelling,
	onSelect,
	children,
}: {
	children: React.ReactElement;
	network: Networks.Network;
	profile: ProfilesContracts.IProfile;
	isCancelling?: boolean;
	setRetryFn?: (function_?: () => void) => void;
	onContinue?: (selectedWallets: LedgerData[]) => void;
	onSelect?: (selectedWallets: LedgerData[]) => void;
}) => {
	const pageSize = 0;
	const legacyPageSize = 5;
	const ledgerScanner = useLedgerScanner(network.coin(), network.id(), { legacyPageSize, pageSize, useLegacy: true });

	const { scan, selectedWallets, canRetry, isScanning, abortScanner, error, loadedWallets, wallets } = ledgerScanner;
	const walletsBySlip44 = (slip44: ConfigKey.Slip44Legacy | ConfigKey.Slip44) => {
		const ledgerPaths = wallets
			.filter(({ path }) => BIP44.parse(path).coinType === network.config().get(slip44))
			.map(({ path }) => path);
		return ledgerPaths.sort((a, b) => (BIP44.parse(a!).addressIndex > BIP44.parse(b!).addressIndex ? -1 : 1))[0];
	};

	// TODO: Uncomment if we also want to import 111 slip.
	const lastPath = useMemo(() => walletsBySlip44(ConfigKey.Slip44), [profile, wallets]);
	const lastLegacyPath = useMemo(() => walletsBySlip44(ConfigKey.Slip44Legacy), [profile, wallets]);

	const scanMore = useCallback(() => {
		scan(profile, lastPath, lastLegacyPath);
	}, [scan, lastPath, profile, lastLegacyPath]);

	useEffect(() => {
		if (!isScanning) {
			onSelect?.(selectedWallets);
		}
	}, [selectedWallets]);

	useEffect(() => {
		if (canRetry) {
			setRetryFn?.(() => scan(profile, lastPath, lastLegacyPath));
		} else {
			setRetryFn?.(undefined);
		}
		return () => setRetryFn?.(undefined);
	}, [setRetryFn, scan, canRetry, profile, lastPath, lastLegacyPath]);

	useEffect(() => {
		if (canRetry) {
			setRetryFn?.(() => scan(profile, lastPath, lastLegacyPath));
		} else {
			setRetryFn?.(undefined);
		}
		return () => setRetryFn?.(undefined);
	}, [setRetryFn, scan, canRetry, profile, lastPath, lastLegacyPath]);

	useEffect(() => {
		scan(profile, lastPath, lastLegacyPath);

		return () => {
			abortScanner();
		};
	}, [profile]);

	useEffect(() => {
		if (isCancelling) {
			return;
		}

		if (loadedWallets.length === 0) {
			return;
		}

		if (toasts.isActive("wallet-loading")) {
			toasts.update("wallet-loading", "success", showLoadedLedgerWalletsMessage(loadedWallets));
		} else {
			toasts.success(showLoadedLedgerWalletsMessage(loadedWallets), {
				autoClose: false,
				toastId: "wallet-loading",
			});
		}
	}, [loadedWallets]);

	useEffect(() => {
		if (!isScanning || isCancelling) {
			toasts.dismiss("wallet-loading");
		}
	}, [isScanning, isCancelling]);

	if (isCancelling) {
		return <LedgerCancelling />;
	}

	return (
		<section data-testid="LedgerScanStep" className="space-y-4">
			<div className="pb-20">
				{error ? (
					<Alert variant="danger">
						<span data-testid="LedgerScanStep__error">{error}</span>
					</Alert>
				) : (
					<LedgerTable
						network={network}
						{...ledgerScanner}
						scanMore={scanMore}
						pageSize={pageSize + legacyPageSize}
					/>
				)}
				{children}
			</div>
		</section>
	);
};
