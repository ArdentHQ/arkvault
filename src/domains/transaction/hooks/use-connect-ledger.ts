import { useCallback, useEffect, useState } from "react";
import { useLedgerContext } from "@/app/contexts";
import { Contracts } from "@/app/lib/profiles";

export const useConnectLedger = ({
	onReady,
	profile,
	isLedgerModelSupported = true,
	canConnect = true,
}: {
	onReady: () => void;
	profile: Contracts.IProfile;
	isLedgerModelSupported?: boolean;
	canConnect?: boolean;
}) => {
	const { isConnected, ledgerDevice, connect } = useLedgerContext();
	const [isWaitingLedger, setIsWaitingLedger] = useState(false);

	const connectLedger = useCallback(async () => {
		if (!canConnect) {
			return;
		}

		await connect(profile);
		setIsWaitingLedger(true);
	}, [canConnect, profile, connect]);

	useEffect(() => {
		if (!isConnected && ledgerDevice?.id && isWaitingLedger) {
			void connectLedger();
		}

		if (isConnected && isWaitingLedger && isLedgerModelSupported) {
			void onReady();
			setIsWaitingLedger(false);
		}
	}, [isConnected, ledgerDevice?.id, isWaitingLedger, isLedgerModelSupported]);

	return { connectLedger };
};
