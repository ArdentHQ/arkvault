import { Networks } from "@ardenthq/sdk";
import React from "react";
import { useTranslation } from "react-i18next";

import { NetworkIcon } from "@/domains/network/components/NetworkIcon";
import {
	TransactionDetail,
	TransactionDetailProperties,
} from "@/domains/transaction/components/TransactionDetail/TransactionDetail";
import { useBreakpoint } from "@/app/hooks";
import { networkDisplayName } from "@/utils/network-utils";

type TransactionNetworkProperties = {
	network: Networks.Network;
} & TransactionDetailProperties;

export const TransactionNetwork = ({
	network,
	borderPosition = "top",
	...properties
}: TransactionNetworkProperties) => {
	const { t } = useTranslation();
	const { isXs, isSm } = useBreakpoint();

	return (
		<TransactionDetail
			data-testid="TransactionNetwork"
			label={t("TRANSACTION.CRYPTOASSET")}
			extra={<NetworkIcon network={network} size="lg" isCompact={isXs || isSm} />}
			borderPosition={borderPosition}
			{...properties}
		>
			{networkDisplayName(network)}
		</TransactionDetail>
	);
};
