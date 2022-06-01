import cn from "classnames";
import { Networks } from "@payvo/sdk";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Address } from "@/app/components/Address";
import { Avatar } from "@/app/components/Avatar";
import { useActiveProfile, useBreakpoint, useWalletAlias } from "@/app/hooks";
import {
	TransactionDetail,
	TransactionDetailProperties,
} from "@/domains/transaction/components/TransactionDetail/TransactionDetail";
import { TransactionDelegateIcon } from "@/domains/transaction/components/TransactionDetail/TransactionResponsiveIcon/TransactionResponsiveIcon";

type TransactionSenderProperties = {
	address: string;
	network: Networks.Network;
} & TransactionDetailProperties;

export const TransactionSender = ({
	address,
	network,
	borderPosition = "top",
	...properties
}: TransactionSenderProperties) => {
	const { t } = useTranslation();
	const { isSm, isXs } = useBreakpoint();

	const activeProfile = useActiveProfile();

	const { getWalletAlias } = useWalletAlias();
	const { alias, isDelegate } = useMemo(
		() =>
			getWalletAlias({
				address,
				network,
				profile: activeProfile,
			}),
		[activeProfile, getWalletAlias, address, network],
	);

	const iconSize = isSm || isXs ? "xs" : "lg";
	const iconSpaceClass = isSm || isXs ? "space-x-2" : "-space-x-1";

	return (
		<TransactionDetail
			data-testid="TransactionSender"
			label={t("TRANSACTION.SENDER")}
			extra={
				<div className={cn("flex items-center", iconSpaceClass)}>
					{isDelegate && <TransactionDelegateIcon />}
					<Avatar address={address} size={iconSize} />
				</div>
			}
			borderPosition={borderPosition}
			{...properties}
		>
			<div className="w-0 flex-1 overflow-auto text-right md:text-left">
				<Address
					address={address}
					walletName={alias}
					walletNameClass="text-theme-text"
					alignment={isXs || isSm ? "right" : undefined}
				/>
			</div>
		</TransactionDetail>
	);
};
