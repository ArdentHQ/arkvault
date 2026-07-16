import { useCallback, useEffect, useState } from "react";
import { useLedgerContext } from "@/app/contexts";
import { Contracts } from "@/app/lib/profiles";

export const useConnectLedger = ({
	onReady,
	profile,
	canConnect = true,
}: {
	onReady: () => void | Promise<void>;
	profile: Contracts.IProfile;
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
		if (isConnected && isWaitingLedger) {
			void (async () => {
				await onReady();
				setIsWaitingLedger(false);
				// Don't trust the connection to still be valid for a later attempt -
				// force a fresh connect()/app-open verification next time.
				await disconnect();
			})();
		}
	}, [isConnected, ledgerDevice?.id, isWaitingLedger]);

	return { abort, isWaitingLedger, triggerLedger };
};
