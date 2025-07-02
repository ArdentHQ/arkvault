import React from "react";
import { Address } from "@/app/components/Address";
import { useWalletAlias } from "@/app/hooks";
import { Contracts } from "@/app/lib/profiles";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { AddressViewSelection, AddressViewType } from "@/domains/portfolio/hooks/use-address-panel";

export const ViewingAddressInfo = ({
	profile,
	wallets,
	availableWallets,
	mode,
}: {
	profile: Contracts.IProfile;
	wallets: Contracts.IReadWriteWallet[];
	availableWallets: number;
	mode: AddressViewType;
}) => {
	const { t } = useTranslation();
	const { getWalletAlias } = useWalletAlias();

	const lastWallet = wallets[wallets.length - 1];

	if (mode === AddressViewSelection.single && lastWallet) {
		const { alias } = getWalletAlias({
			address: lastWallet.address(),
			network: lastWallet.network(),
			profile,
		});

		return (
			<Address
				alignment="center"
				walletName={alias}
				truncateOnTable
				maxNameChars={20}
				walletNameClass={cn("text-sm leading-[17px] sm:text-base sm:leading-5", {
					"text-theme-primary-600 dark:text-theme-dark-navy-400 dim:text-theme-dim-navy-600":
						availableWallets > 1,
				})}
			/>
		);
	}

	return (
		<div className="text-theme-primary-600 dark:text-theme-dark-navy-400 dim:text-theme-dim-navy-600 text-sm leading-[17px] font-semibold sm:text-base sm:leading-5">
			{t("COMMON.MULTIPLE_ADDRESSES", {
				count: wallets.length,
			})}
		</div>
	);
};
