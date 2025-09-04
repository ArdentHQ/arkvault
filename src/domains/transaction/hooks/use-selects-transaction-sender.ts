import { useActiveProfile } from "@/app/hooks";
import { useEffect, useState } from "react";

export const useSelectsTransactionSender = ({ active }: { active: boolean }) => {
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

	return {
		activeWallet,
		setActiveWallet,
	};
};
