import { Networks, Contracts, ConfigKey } from "@/app/lib/mainsail";
import { Contracts as ProfilesContracts } from "@/app/lib/profiles";
import React, { useCallback, useEffect, useMemo } from "react";
import { Trans } from "react-i18next";
import { BIP44 } from "@ardenthq/arkvault-crypto";
import { toasts } from "@/app/services";
import { Alert } from "@/app/components/Alert";
import { LedgerData, useLedgerScanner } from "@/app/contexts/Ledger";
import { LedgerCancelling } from "@/domains/portfolio/components/ImportWallet/Ledger/LedgerCancelling";
import { LedgerTable } from "@/domains/portfolio/components/ImportWallet/Ledger/LedgerScanStep";

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
	isLoading,
	isSelected,
	disableColdWallets,
}: {
	disableColdWallets?: boolean
	children: React.ReactElement;
	network: Networks.Network;
	profile: ProfilesContracts.IProfile;
	isLoading?: boolean;
	isCancelling?: boolean;
	isSelected?: (path: string) => boolean;
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
						isScanning={isScanning || !!isLoading}
						isSelected={isSelected ?? ledgerScanner.isSelected}
						disableColdWallets={disableColdWallets}
					/>
				)}
				{children}
			</div>
		</section>
	);
};
