import { useCallback, useEffect, useState } from "react";
import { useLedgerContext } from "@/app/contexts";
import { Contracts } from "@/app/lib/profiles";

export const useConnectLedger = ({ onReady, profile, isLedgerModelSupported = true }: { onReady: () => void; profile: Contracts.IProfile, isLedgerModelSupported?: boolean }) => {
	const { isConnected, ledgerDevice, connect } = useLedgerContext();
	const [isWaitingLedger, setIsWaitingLedger] = useState(false);

	useEffect(() => {
		if (!isConnected && ledgerDevice?.id && isWaitingLedger) {
			void connectLedger();
		}

		if (isConnected && isWaitingLedger && isLedgerModelSupported) {
			void onReady();
			setIsWaitingLedger(false);
		}
	}, [isConnected, ledgerDevice?.id, isWaitingLedger, isLedgerModelSupported]);

	const connectLedger = useCallback(async () => {
		setIsWaitingLedger(true);
		await connect(profile);
	}, [profile, connect]);

	return { connectLedger };
};
