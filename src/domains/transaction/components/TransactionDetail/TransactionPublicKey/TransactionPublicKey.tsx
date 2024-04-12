import cn from "classnames";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import {
	TransactionDetail,
	TransactionDetailProperties,
} from "@/domains/transaction/components/TransactionDetail/TransactionDetail";
import { useBreakpoint } from "@/app/hooks";
import { TruncateMiddle } from "@/app/components/TruncateMiddle";

type Properties = { publicKey?: string | unknown } & TransactionDetailProperties;

export const TransactionPublicKey = ({ borderPosition = "top", publicKey, ...properties }: Properties) => {
	const { t } = useTranslation();
	const { isMdAndAbove, isXs, isSm } = useBreakpoint();

	const maxChars = useMemo(() => {
		if (isMdAndAbove) {
			return 56;
		}

		if (isXs) {
			return 20;
		}

		return 30;
	}, [isMdAndAbove, isXs]);

	return (
		<TransactionDetail
			label={t("TRANSACTION.VALIDATOR_PUBLIC_KEY")}
			borderPosition={borderPosition}
			{...properties}
		>
			<div className="flex w-full items-center space-x-3 overflow-hidden">
				<span className={cn("overflow-hidden", { "w-full": !isMdAndAbove })}>
					<div className={cn("flex items-center", { "justify-end": !isMdAndAbove })}>
						{typeof publicKey === "string" && <TruncateMiddle text={publicKey} maxChars={maxChars} />}
					</div>
				</span>
			</div>
		</TransactionDetail>
	);
};
