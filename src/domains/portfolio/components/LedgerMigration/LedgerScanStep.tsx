import { Networks, Contracts } from "@/app/lib/mainsail";
import { Contracts as ProfilesContracts } from "@/app/lib/profiles";
import React, { useCallback, useEffect, useMemo } from "react";
import { Trans } from "react-i18next";
import { BIP44 } from "@ardenthq/arkvault-crypto";
import { toasts } from "@/app/services";
import { LedgerData, useLedgerScanner } from "@/app/contexts/Ledger";
import { LedgerCancelling } from "@/domains/portfolio/components/ImportWallet/Ledger/LedgerCancelling";
import { LedgerTable } from "@/domains/portfolio/components/ImportWallet/Ledger/LedgerScanStep";
import { Alert } from "@/app/components/Alert";

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
	const ledgerScanner = useLedgerScanner(network.coin(), network.id());

	const { scan, selectedWallets, canRetry, isScanning, abortScanner, error, loadedWallets, wallets } = ledgerScanner;
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
		if (!isScanning) {
			onSelect?.(selectedWallets);
		}
	}, [selectedWallets]);

	useEffect(() => {
		if (canRetry) {
			setRetryFn?.(() => scan(profile, lastPath));
		} else {
			setRetryFn?.(undefined);
		}
		return () => setRetryFn?.(undefined);
	}, [setRetryFn, scan, canRetry, profile, lastPath]);

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
					<LedgerTable network={network} {...ledgerScanner} scanMore={scanMore} />
				)}
				{children}
			</div>
		</section>
	);
};
