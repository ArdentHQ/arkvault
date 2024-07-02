import { Networks } from "@ardenthq/sdk";
import cn from "classnames";
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
import { MultiSignatureStatus } from "@/domains/transaction/hooks";

type TransactionMultisignatureStatusProperties = {
	address: string;
	network: Networks.Network;
	status: MultiSignatureStatus;
} & TransactionDetailProperties;

export const TransactionMultisignatureStatus = ({
	address,
	network,
	borderPosition = "top",
	status,
	...properties
}: TransactionMultisignatureStatusProperties) => {
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

	const isAwaitingFinalSignature = ["isAwaitingFinalSignature", "isMultiSignatureReady"].includes(status.value);

	return (
		<TransactionDetail
			data-testid="TransactionMultisignatureStatus"
			label={t("TRANSACTION.STATUS")}
			extra={
				isAwaitingFinalSignature && (
					<div className="w-full md:w-auto">
						<div className="w-full text-right text-theme-secondary-700 dark:text-theme-secondary-500 md:hidden">
							{status.label} {t("TRANSACTION.MULTISIGNATURE.AWAITING_BY")}
						</div>
						<div className={cn("flex items-center", iconSpaceClass)}>
							<div className="w-full overflow-auto text-right md:hidden md:text-left">
								<Address
									address={address}
									walletName={alias}
									walletNameClass="text-theme-text"
									alignment="right"
								/>
							</div>

							{isDelegate && <TransactionDelegateIcon />}
							<Avatar address={address} size={iconSize} />
						</div>
					</div>
				)
			}
			borderPosition={borderPosition}
			{...properties}
		>
			{!isAwaitingFinalSignature && <>{status.label}</>}
			{isAwaitingFinalSignature && (
				<div className="flex w-full items-center space-x-4">
					<div className="hidden md:block">
						{status.label} {t("TRANSACTION.MULTISIGNATURE.AWAITING_BY")}
					</div>
					<div className="hidden w-0 flex-1 overflow-auto text-right md:block md:text-left">
						<Address
							address={address}
							walletName={alias}
							walletNameClass="text-theme-text"
							alignment={isXs || isSm ? "right" : undefined}
						/>
					</div>
				</div>
			)}
		</TransactionDetail>
	);
};
