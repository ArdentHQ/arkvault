import cn from "classnames";
import { DTO } from "@ardenthq/sdk-profiles";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Address } from "@/app/components/Address";
import { Avatar } from "@/app/components/Avatar";
import { Divider } from "@/app/components/Divider";
import { Link } from "@/app/components/Link";
import { TransactionDetail } from "@/domains/transaction/components/TransactionDetail";
import { useBreakpoint } from "@/app/hooks";
import { TransactionDelegateIcon } from "@/domains/transaction/components/TransactionDetail/TransactionResponsiveIcon";

export interface TransactionDetailAddressListProperties {
	label?: string;
	transaction: DTO.ExtendedConfirmedTransactionData;
	addresses: {
		address: string;
		amount?: number;
		alias?: string;
		isDelegate?: boolean;
	}[];
}

export const TransactionDetailAddressList = ({
	label,
	transaction,
	addresses,
}: TransactionDetailAddressListProperties) => {
	const { t } = useTranslation();
	const { isSm, isXs } = useBreakpoint();

	const recipient = useMemo(() => {
		const owned = addresses.find((recipient) => recipient.address === transaction.wallet().address());

		return owned || addresses[0];
	}, [addresses, transaction]);

	const iconSize = isSm || isXs ? "xs" : "lg";
	const iconSpaceClass = isSm || isXs ? "space-x-2" : "-space-x-1";

	const Label = (
		<div className="flex items-center space-x-4">
			<span>{label || t("TRANSACTION.RECIPIENTS_COUNT", { count: addresses.length })}</span>
			<div className="hidden sm:inline-block">
				<Divider type="vertical" size="md" />
			</div>

			<Link to={transaction.explorerLink()} isExternal className="hidden sm:block">
				{t("TRANSACTION.VIEW_RECIPIENTS_LIST")}
			</Link>
		</div>
	);

	return (
		<TransactionDetail
			data-testid="TransactionDetailAddressList"
			label={Label}
			extra={
				<div className={cn("hidden items-center sm:flex", iconSpaceClass)}>
					{recipient?.isDelegate && <TransactionDelegateIcon />}
					<Avatar address={recipient?.address} size={iconSize} />
				</div>
			}
		>
			<div className="hidden w-0 flex-1 text-right sm:block md:text-left">
				<Address
					address={recipient?.address}
					walletName={recipient?.alias}
					walletNameClass="flex-1 md:flex-none text-theme-text"
				/>
			</div>

			<Link to={transaction.explorerLink()} isExternal className="block w-32 sm:hidden">
				{t("TRANSACTION.VIEW_RECIPIENTS_LIST")}
			</Link>
		</TransactionDetail>
	);
};
