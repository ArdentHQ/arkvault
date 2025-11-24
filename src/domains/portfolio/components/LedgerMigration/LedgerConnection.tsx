import { Networks } from "@/app/lib/mainsail";
import React, { useEffect } from "react";
import { useLedgerContext } from "@/app/contexts/Ledger";
import { ConnectionContent } from "@/domains/portfolio/components/ImportWallet/Ledger/LedgerConnectionStep";
import { LedgerCancelling } from "@/domains/portfolio/components/ImportWallet/Ledger/LedgerCancelling";
import { Contracts } from "@/app/lib/profiles";

export const LedgerConnectionStep = ({
	onConnect,
	onFailed,
	isCancelling,
	network,
	profile,
}: {
	profile: Contracts.IProfile;
	network: Networks.Network;
	isCancelling?: boolean;
	onConnect?: () => void;
	onFailed?: (error: Error) => void;
}) => {
	const { connect, abortConnectionRetry, error, isConnected } = useLedgerContext();

	useEffect(() => {
		void connect(profile);
	}, [profile]);

	useEffect(() => {
		if (error) {
			onFailed?.(new Error(error));
		}
	}, [isConnected, error]);

	useEffect(() => {
		if (isConnected) {
			onConnect?.();
		}
	}, [isConnected, onConnect]);

	useEffect(
		() => () => {
			abortConnectionRetry();
		},
		[abortConnectionRetry],
	);

	if (isCancelling) {
		return <LedgerCancelling />;
	}

	return (
		<section data-testid="LedgerConnectionStep" className="space-y-4">
			<ConnectionContent error={error} isConnected={isConnected} coinName={network.coin()} />
		</section>
	);
};
