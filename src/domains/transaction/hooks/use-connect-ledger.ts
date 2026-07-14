import { useCallback, useEffect, useState } from "react";
import { useLedgerContext } from "@/app/contexts";
import { Contracts } from "@/app/lib/profiles";

export const useConnectLedger = ({
	onReady,
	profile,
	isLedgerModelSupported = true,
	canConnect = true,
}: {
	onReady: () => void | Promise<void>;
	profile: Contracts.IProfile;
	isLedgerModelSupported?: boolean;
	canConnect?: boolean;
}) => {
	const { isConnected, ledgerDevice, connect, abortConnectionRetry, disconnect } = useLedgerContext();
	const [isWaitingLedger, setIsWaitingLedger] = useState(false);

	const triggerLedger = useCallback(() => {
		if (!canConnect) {
			return;
		}

		setIsWaitingLedger(true);
	}, [canConnect]);

	const abort = () => {
		abortConnectionRetry();
		disconnect();
		setIsWaitingLedger(false);
	};

	useEffect(() => {
		if (!isConnected && ledgerDevice?.id && isWaitingLedger) {
			void connect(profile);
		}
	}, [isWaitingLedger, isConnected, ledgerDevice?.id]);

	useEffect(() => {
		if (isConnected && isWaitingLedger && isLedgerModelSupported) {
			void (async () => {
				await onReady();
				setIsWaitingLedger(false);
			})();
		}
	}, [isConnected, ledgerDevice?.id, isWaitingLedger, isLedgerModelSupported]);

	return { abort, isWaitingLedger, triggerLedger };
};
