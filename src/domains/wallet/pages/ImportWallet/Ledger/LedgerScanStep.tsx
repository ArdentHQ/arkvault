import { Networks, Contracts } from "@ardenthq/sdk";
import { Contracts as ProfilesContracts } from "@ardenthq/sdk-profiles";
import Tippy from "@tippyjs/react";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import { Column } from "react-table";
import { BIP44 } from "@ardenthq/sdk-cryptography";
import { LedgerTableProperties } from "./LedgerTabs.contracts";
import { toasts } from "@/app/services";
import { Address } from "@/app/components/Address";
import { Alert } from "@/app/components/Alert";
import { Amount } from "@/app/components/Amount";
import { Checkbox } from "@/app/components/Checkbox";
import { Header } from "@/app/components/Header";
import { Skeleton } from "@/app/components/Skeleton";
import { Table, TableCell, TableRow } from "@/app/components/Table";
import { useLedgerContext } from "@/app/contexts";
import { LedgerData, useLedgerScanner } from "@/app/contexts/Ledger";
import { LedgerCancelling } from "@/domains/wallet/pages/ImportWallet/Ledger/LedgerCancelling";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import cn from "classnames";
import { AmountWrapper, LedgerLoaderOverlay, LedgerMobileItem } from "./LedgerScanStep.blocks";

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

	const length = 5;
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
			<div className="relative hidden rounded-xl border border-transparent sm:block md:border-theme-secondary-300 dark:md:border-theme-secondary-800">
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
					<LedgerLoaderOverlay className="rounded-xl">
						<Trans
							i18nKey="WALLETS.PAGE_IMPORT_WALLET.LEDGER_SCAN_STEP.LOADING_WALLETS"
							values={{ count: length }}
						/>
					</LedgerLoaderOverlay>
				)}
			</div>

			<div className="sm:hidden">
				<div className="mb-3 flex h-9 w-full flex-row items-center justify-between border-l-2 border-l-theme-primary-400 bg-theme-primary-100 px-3 dark:border-l-theme-primary-300 dark:bg-theme-secondary-800">
					<span className="text-base font-semibold text-theme-secondary-700 dark:text-theme-secondary-500">
						{t("COMMON.ADDRESS")}
					</span>
					<label
						className={cn("flex flex-row items-center gap-2", {
							"text-theme-secondary-500 dark:text-theme-secondary-700": isScanning,
							"text-theme-secondary-700 dark:text-theme-secondary-500": !isScanning,
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
							<LedgerMobileItem
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
							<LedgerMobileItem
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
		return <Trans i18nKey="WALLETS.PAGE_IMPORT_WALLET.LEDGER_SCAN_STEP.LOADED_SINGLE_WALLET" />;
	}

	return (
		<Trans
			i18nKey="WALLETS.PAGE_IMPORT_WALLET.LEDGER_SCAN_STEP.LOADED_WALLETS"
			values={{ count: wallets.length }}
		/>
	);
};

export const LedgerScanStep = ({
	setRetryFn,
	profile,
	cancelling,
}: {
	profile: ProfilesContracts.IProfile;
	cancelling: boolean;
	setRetryFn?: (function_?: () => void) => void;
}) => {
	const { t } = useTranslation();

	const { watch, register, unregister, setValue } = useFormContext();
	const [network] = useState<Networks.Network>(() => watch("network"));

	const ledgerScanner = useLedgerScanner(network.coin(), network.id());

	const { scan, selectedWallets, canRetry, isScanning, abortScanner, error, loadedWallets, wallets } = ledgerScanner;

	// eslint-disable-next-line arrow-body-style
	useEffect(() => {
		return () => {
			abortScanner();
		};
	}, [abortScanner]);

	const lastPath = useMemo(() => {
		const ledgerPaths = wallets.map(({ path }) => path);
		const profileWalletsPaths = profile
			.wallets()
			.values()
			.map((wallet) => wallet.data().get<string>(ProfilesContracts.WalletData.DerivationPath));

		return [...profileWalletsPaths, ...ledgerPaths]
			.filter(Boolean)
			.sort((a, b) => (BIP44.parse(a!).addressIndex > BIP44.parse(b!).addressIndex ? -1 : 1))[0];
	}, [profile, wallets]);

	const scanMore = useCallback(() => {
		scan(profile, lastPath);
	}, [scan, lastPath, profile]);

	useEffect(() => {
		setValue("isFinished", !isScanning, { shouldDirty: true, shouldValidate: true });
	}, [isScanning, setValue]);

	useEffect(() => {
		if (canRetry) {
			setRetryFn?.(() => scan(profile, lastPath));
		} else {
			setRetryFn?.(undefined);
		}
		return () => setRetryFn?.(undefined);
	}, [setRetryFn, scan, canRetry, profile, lastPath]);

	useEffect(() => {
		scan(profile, lastPath);
	}, [profile]);

	useEffect(() => {
		register("wallets", { required: true, validate: (value) => Array.isArray(value) && value.length > 0 });
		register("isFinished", { required: true });

		return () => {
			unregister("wallets");
			unregister("isFinished");
		};
	}, [register, unregister]);

	useEffect(() => {
		if (cancelling) {
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
		if (!isScanning || cancelling) {
			toasts.dismiss("wallet-loading");
		}
	}, [isScanning, cancelling]);

	useEffect(() => {
		setValue("wallets", selectedWallets, { shouldDirty: true, shouldValidate: true });
	}, [selectedWallets, setValue]);

	if (cancelling) {
		return <LedgerCancelling />;
	}

	return (
		<section data-testid="LedgerScanStep" className="space-y-4">
			<Header
				title={t("WALLETS.PAGE_IMPORT_WALLET.LEDGER_SCAN_STEP.TITLE")}
				subtitle={t("WALLETS.PAGE_IMPORT_WALLET.LEDGER_SCAN_STEP.SUBTITLE")}
				titleIcon={<Icon name="NoteCheck" dimensions={[22, 22]} className="text-theme-primary-600" />}
				className="hidden sm:block"
			/>

			{error ? (
				<Alert variant="danger">
					<span data-testid="LedgerScanStep__error">{error}</span>
				</Alert>
			) : (
				<LedgerTable network={network} {...ledgerScanner} scanMore={scanMore} />
			)}
		</section>
	);
};
