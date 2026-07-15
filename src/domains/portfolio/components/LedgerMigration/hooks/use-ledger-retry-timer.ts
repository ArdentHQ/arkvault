import { persistLedgerConnection } from "@/app/contexts/Ledger/utils/connection";
import { Contracts } from "@/app/lib/profiles";
import { useCallback, useEffect, useRef, useState } from "react";

export const useLedgerRetryTimer = ({
	thresholdSeconds = 10,
	profile,
}: {
	profile: Contracts.IProfile;
	thresholdSeconds?: number;
}) => {
	const startTimeRef = useRef(Date.now());
	const [elapsedSeconds, setElapsedSeconds] = useState(0);
	const [isRetrying, setIsRetrying] = useState(false);

	const reset = useCallback(async () => {
		setIsRetrying(true);
		await profile.ledger().connect();
		await persistLedgerConnection({ ledgerService: profile.ledger() });
		setIsRetrying(false);
		startTimeRef.current = Date.now();
		setElapsedSeconds(0);
	}, []);

	useEffect(() => {
		const interval = setInterval(() => {
			console.log("interval");
			setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	const shouldShowRetry = elapsedSeconds >= thresholdSeconds;

	return { elapsedSeconds, isRetrying, reset, shouldShowRetry };
};
