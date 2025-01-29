import React from "react";
import { Address } from "@/app/components/Address";
import { useWalletAlias } from "@/app/hooks";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useTranslation } from "react-i18next";

export const ViewingAddressInfo = ({
	profile,
	wallets,
}: {
	profile: Contracts.IProfile;
	wallets: Contracts.IReadWriteWallet[];
}) => {
	const { t } = useTranslation();
	const { getWalletAlias } = useWalletAlias();
	const firstWallet = wallets.at(0);

	if (wallets.length === 1 && firstWallet) {
		const { alias } = getWalletAlias({
			address: firstWallet.address(),
			network: firstWallet.network(),
			profile,
		});

		return (
			<Address
				alignment="center"
				walletName={alias}
				truncateOnTable
				maxNameChars={20}
				walletNameClass="text-theme-primary-600 text-sm leading-[17px] sm:text-base sm:leading-5 dark:textdark-theme-dark-navy-400"
			/>
		);
	}

	return (
		<div className="dark:textdark-theme-dark-navy-400 text-base text-sm font-semibold leading-[17px] text-theme-primary-600 sm:text-base sm:leading-5">
			{t("COMMON.MULTIPLE_ADDRESSES", {
				count: wallets.length,
			})}
		</div>
	);
};
