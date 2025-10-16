import { omitBy, uniqBy } from "@/app/lib/helpers";
import { useCallback, useMemo, useReducer, useRef, useState } from "react";

import { Contracts } from "@/app/lib/mainsail";
import { LedgerData } from "@/app/contexts/Ledger/Ledger.contracts";
import { Contracts as ProfilesContracts } from "@/app/lib/profiles";
import { persistLedgerConnection } from "@/app/contexts/Ledger/utils/connection";
import { scannerReducer } from "./scanner.state";
import { useLedgerContext } from "@/app/contexts/Ledger/Ledger";

export const useLedgerScanner = (
	coin: string,
	network: string,
	options?: { useLegacy?: boolean; pageSize?: number; legacyPageSize?: number },
) => {
	const { setBusy, setIdle, resetConnectionState, disconnect } = useLedgerContext();

	const [state, dispatch] = useReducer(scannerReducer, {
		selected: [],
		wallets: [],
	});

	const [loadedWallets, setLoadedWallets] = useState<Contracts.WalletData[]>([]);

	const { selected, wallets, error } = state;

	const isSelected = useCallback((path: string) => selected.includes(path), [selected]);

	const selectedWallets = useMemo(() => wallets.filter((item) => selected.includes(item.path)), [selected, wallets]);
	const canRetry = !!error;

	const [isScanning, setIsScanning] = useState(false);
	const [isScanningMore, setIsScanningMore] = useState(false);
	const abortRetryReference = useRef<boolean>(false);

	const onProgress = (wallet: Contracts.WalletData) => {
		setLoadedWallets(uniqBy([...loadedWallets, wallet], (wallet) => wallet.data.address));
	};

	const scanAddresses = async (profile: ProfilesContracts.IProfile, startPath?: string, legacyStartPath?: string) => {
		const ledgerService = profile.ledger();

		setIdle();
		dispatch({ type: "waiting" });

		setIsScanning(true);

		const isLoadingMore = wallets.length > 0;
		if (isLoadingMore) {
			setIsScanningMore(true);
		}

		setBusy();
		abortRetryReference.current = false;

		await persistLedgerConnection({
			hasRequestedAbort: () => abortRetryReference.current,
			ledgerService,
			options: { factor: 1, randomize: false, retries: 50 },
		});

		// @ts-ignore
		let ledgerWallets = await ledgerService.scan({ onProgress, pageSize: options?.pageSize, startPath });

		if (options?.useLegacy) {
			const legacyWallets = await ledgerService.scan({
				onProgress,
				pageSize: options.legacyPageSize,
				startPath: legacyStartPath,
				useLegacy: options?.useLegacy,
			});
			ledgerWallets = { ...ledgerWallets, ...legacyWallets };
		}

		let ledgerData: LedgerData[] = [];

		for (const [path, data] of Object.entries(ledgerWallets)) {
			const address = data.address();

			const wallet = await profile.walletFactory().fromAddress({ address });
			await wallet.synchroniser().identity();

			ledgerData.push({
				address,
				balance: wallet.balance(),
				path,
			});
		}

		if (isLoadingMore) {
			ledgerData = omitBy(ledgerData, (wallet) => wallets.some((w) => w.address === wallet.address));
		} else {
			ledgerData = uniqBy([...wallets, ...ledgerData], (wallet) => wallet.address);
		}

		/* istanbul ignore next -- @preserve */
		if (abortRetryReference.current) {
			return;
		}

		dispatch({ payload: ledgerData, type: "success" });

		setIdle();
		setIsScanning(false);
		setIsScanningMore(false);
	};

	const scan = async (profile: ProfilesContracts.IProfile, startPath?: string, legacyStartPath?: string) => {
		try {
			await scanAddresses(profile, startPath, legacyStartPath);
		} catch (error) {
			if (error?.message?.includes?.("busy")) {
				await new Promise((resolve) => setTimeout(resolve, 1000));
				await scan(profile, startPath);
				return;
			}

			dispatch({ error: error.message, type: "failed" });
		}
	};

	const abortScanner = useCallback(async () => {
		await disconnect();
		await resetConnectionState();

		abortRetryReference.current = true;
		setIdle();
	}, [setIdle]);

	const toggleSelect = useCallback((path: string) => dispatch({ path, type: "toggleSelect" }), [dispatch]);
	const toggleSelectAll = useCallback(() => dispatch({ type: "toggleSelectAll" }), [dispatch]);

	return {
		abortScanner,
		canRetry,
		error,
		isScanning,
		isScanningMore,
		isSelected,
		loadedWallets,
		scan,
		selectedWallets,
		toggleSelect,
		toggleSelectAll,
		wallets,
	};
};
