import { useActiveProfile } from "@/app/hooks";
import { useEffect, useState } from "react";
import { Contracts } from "@/app/lib/profiles";
import { useSearchParams } from "react-router";

export const useSelectsTransactionSender = ({
	active,
	onWalletChange,
}: {
	active: boolean;
	onWalletChange?: (wallet?: Contracts.IReadWriteWallet) => void;
}) => {
	const [searchParams, setSearchParams] = useSearchParams();

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

			if (searchParams.has("method")) {
				searchParams.delete("method");
				setSearchParams(searchParams);
			}
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
