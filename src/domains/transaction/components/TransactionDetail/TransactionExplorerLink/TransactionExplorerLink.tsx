import cn from "classnames";
import { DTO } from "@payvo/sdk-profiles";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Clipboard } from "@/app/components/Clipboard";
import { Icon } from "@/app/components/Icon";
import { Link } from "@/app/components/Link";

import {
	TransactionDetail,
	TransactionDetailProperties,
} from "@/domains/transaction/components/TransactionDetail/TransactionDetail";
import { useBreakpoint } from "@/app/hooks";
import { TruncateMiddle } from "@/app/components/TruncateMiddle";

type TransactionExplorerLinkProperties = {
	isDisabled?: boolean;
	transaction: DTO.ExtendedConfirmedTransactionData | DTO.ExtendedSignedTransactionData;
} & TransactionDetailProperties;

export const TransactionExplorerLink = ({
	isDisabled,
	transaction,
	borderPosition = "top",
	...properties
}: TransactionExplorerLinkProperties) => {
	const { t } = useTranslation();
	const { isMdAndAbove, isXs } = useBreakpoint();

	const maxChars = useMemo(() => {
		if (isMdAndAbove) {
			return 56;
		}

		if (isXs) {
			return 18;
		}

		return 30;
	}, [isMdAndAbove]);

	return (
		<TransactionDetail label={t("TRANSACTION.ID")} borderPosition={borderPosition} {...properties}>
			<div className="flex w-full items-center space-x-3 overflow-hidden">
				<span className={cn("overflow-hidden", { "w-full": !isMdAndAbove })}>
					<Link
						className={cn("flex items-center", { "justify-end": !isMdAndAbove })}
						to={transaction.explorerLink()}
						isDisabled={isDisabled}
						isExternal
					>
						<TruncateMiddle text={transaction.id()} maxChars={maxChars} />
					</Link>
				</span>

				<span className="flex text-theme-primary-300 dark:text-theme-secondary-600">
					<Clipboard variant="icon" data={transaction.id()}>
						<Icon name="Copy" />
					</Clipboard>
				</span>
			</div>
		</TransactionDetail>
	);
};
