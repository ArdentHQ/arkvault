import { Networks } from "@payvo/sdk";
import React from "react";
import { useTranslation } from "react-i18next";

import { NetworkIcon } from "@/domains/network/components/NetworkIcon";
import { TransactionDetailProperties } from "@/domains/transaction/components/TransactionDetail/TransactionDetail";
import { WalletDetail } from "@/domains/wallet/components/WalletDetail";
import { networkDisplayName } from "@/utils/network-utils";

type WalletDetailNetworkProperties = {
	network: Networks.Network;
} & TransactionDetailProperties;

export const WalletDetailNetwork = ({
	network,
	borderPosition = "top",
	...properties
}: WalletDetailNetworkProperties) => {
	const { t } = useTranslation();

	return (
		<WalletDetail
			data-testid="WalletDetailNetwork"
			label={t("TRANSACTION.CRYPTOASSET")}
			extra={
				<>
					<div className="hidden sm:block">
						<NetworkIcon network={network} size="lg" />
					</div>
					<div className="flex items-center sm:hidden">
						<NetworkIcon isCompact network={network} size="lg" noShadow />
					</div>
				</>
			}
			borderPosition={borderPosition}
			{...properties}
		>
			{networkDisplayName(network)}
		</WalletDetail>
	);
};
