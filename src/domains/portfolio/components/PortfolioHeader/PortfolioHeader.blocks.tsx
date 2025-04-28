import React from "react";
import { Address } from "@/app/components/Address";
import { useWalletAlias } from "@/app/hooks";
import { Contracts } from "@/app/lib/profiles";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { AddressViewSelection, useAddressesPanel } from "@/domains/portfolio/hooks/use-address-panel";
import { useActiveNetwork } from "@/app/hooks/use-active-network";

export const ViewingAddressInfo = ({
	profile,
	wallets,
	availableWallets,
}: {
	profile: Contracts.IProfile;
	wallets: Contracts.IReadWriteWallet[];
	availableWallets: number;
}) => {
	const { t } = useTranslation();
	const { getWalletAlias } = useWalletAlias();
	const { activeNetwork } = useActiveNetwork({profile})
	const {addressViewPreference, singleSelectedAddress} = useAddressesPanel({profile});

	const hasSelectedAddress = singleSelectedAddress.length > 0;

	if (addressViewPreference === AddressViewSelection.single && hasSelectedAddress) {
		const activeWallet = profile
			.wallets()
			.findByCoinWithNetwork(activeNetwork.coin(), activeNetwork.id())
			.find((wallet) => wallet.address() === singleSelectedAddress[0]);

		const { alias } = getWalletAlias({
			address: activeWallet.address(),
			network: activeWallet.network(),
			profile,
		});

		return (
			<Address
				alignment="center"
				walletName={alias}
				truncateOnTable
				maxNameChars={20}
				walletNameClass={cn("text-sm leading-[17px] sm:text-base sm:leading-5", {
					"text-theme-primary-600 dark:text-theme-dark-navy-400": availableWallets > 1,
				})}
			/>
		);
	}

	return (
		<div className="dark:textdark-theme-dark-navy-400 text-sm font-semibold leading-[17px] text-theme-primary-600 sm:text-base sm:leading-5">
			{t("COMMON.MULTIPLE_ADDRESSES", {
				count: wallets.length,
			})}
		</div>
	);
};
