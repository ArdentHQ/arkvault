import { useActiveProfile } from "@/app/hooks";
import { useEffect, useState } from "react";
import { Contracts } from "@/app/lib/profiles";
import { useSearchParams } from "react-router";

export const useSelectsTransactionSender = ({
	active,
	senderAddress,
	onWalletChange,
}: {
	active: boolean;
	senderAddress?: string;
	onWalletChange?: (wallet?: Contracts.IReadWriteWallet) => void;
}) => {
	const [resetSearchParamsOnDeactivate, setResetSearchParamsOnDeactivate] = useState(false);
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

			setResetSearchParamsOnDeactivate(true);
		} else {
			setActiveWallet(undefined);

			if (resetSearchParamsOnDeactivate && searchParams.has("method")) {
				setSearchParams(new URLSearchParams());
			}
		}
	}, [active]);

	useEffect(() => {
		if (senderAddress) {
			const wallet = activeProfile.wallets().findByAddressWithNetwork(senderAddress, activeProfile.activeNetwork().id());
			setActiveWallet(wallet);
		}
	}, [senderAddress]);

	useEffect(() => {
		onWalletChange?.(activeWallet);
	}, [activeWallet?.address()]);

	return {
		activeWallet,
		setActiveWallet,
	};
};
