import { uniqBy } from "@ardenthq/sdk-helpers";
import { Contracts as ProfilesContracts } from "@ardenthq/sdk-profiles";
import { Contracts } from "@ardenthq/sdk";
import { useCallback, useMemo, useReducer, useRef, useState } from "react";
import { scannerReducer } from "./scanner.state";
import { useLedgerContext } from "@/app/contexts/Ledger/Ledger";
import { LedgerData } from "@/app/contexts/Ledger/Ledger.contracts";

export const useLedgerScanner = (coin: string, network: string) => {
	const { setBusy, setIdle } = useLedgerContext();

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
		setLoadedWallets((wallets) => uniqBy([...wallets, wallet], (wallet) => wallet.data.address));
	};

	const scan = useCallback(
		async (profile: ProfilesContracts.IProfile, startPath: string) => {
			setIdle();
			dispatch({ type: "waiting" });

			setIsScanning(true);

			if (wallets.length > 0) {
				setIsScanningMore(true);
			}

			setBusy();
			abortRetryReference.current = false;

			try {
				const instance = profile.coins().set(coin, network);

				// @ts-ignore
				const ledgerWallets = await instance.ledger().scan({ onProgress, startPath });

				const legacyWallets = await instance.ledger().scan({ onProgress, useLegacy: true });

				const allWallets = { ...legacyWallets, ...ledgerWallets };

				let ledgerData: LedgerData[] = [];

				for (const [path, data] of Object.entries(allWallets)) {
					const address = data.address();

					/* istanbul ignore next */
					if (!profile.wallets().findByAddressWithNetwork(address, network)) {
						ledgerData.push({
							address,
							balance: data.balance().available.toHuman(),
							path,
						});
					}
				}

				ledgerData = uniqBy([...wallets, ...ledgerData], (wallet) => wallet.address);

				if (abortRetryReference.current) {
					return;
				}

				dispatch({ payload: ledgerData, type: "success" });
			} catch (error) {
				dispatch({ error: error.message, type: "failed" });
			}

			setIdle();
			setIsScanning(false);
			setIsScanningMore(false);
		},
		[coin, network, setBusy, setIdle, state],
	);

	const abortScanner = useCallback(() => {
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
