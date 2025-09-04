import { useActiveProfile } from "@/app/hooks";
import { useEffect, useState } from "react";
import { Contracts } from "@/app/lib/profiles";

export const useSelectsTransactionSender = ({
	active,
	onWalletChange,
}: {
	active: boolean;
	onWalletChange: (wallet?: Contracts.IReadWriteWallet) => void;
}) => {
	const activeProfile = useActiveProfile();

	const guessActiveWallet = () => {
		const selectedWallets = activeProfile.wallets().selected() ?? [activeProfile.wallets().first()];
		return selectedWallets.at(0);
	};

	const [activeWallet, setActiveWallet] = useState(guessActiveWallet);

	useEffect(() => {
		if (active) {
			setActiveWallet(guessActiveWallet());
		} else {
			setActiveWallet(undefined);
		}
	}, [active]);

	useEffect(() => {
		onWalletChange?.(activeWallet);
	}, [activeWallet?.address()]);

	return {
		activeWallet,
		setActiveWallet,
	};
};
