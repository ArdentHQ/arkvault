import React from "react";
import cn from "classnames";
import { useTranslation } from "react-i18next";

import { DTO } from "@ardenthq/sdk-profiles";
import { Address } from "@/app/components/Address";
import { EthereumAvatar } from "@/app/components/Avatar";
import { useBreakpoint } from "@/app/hooks";
import { TransactionDetail } from "@/domains/transaction/components/TransactionDetail/TransactionDetail";

export const MigrationPolygonAddress = ({ transaction }: { transaction: DTO.ExtendedSignedTransactionData }) => {
	const { t } = useTranslation();
	const { isXs, isSm } = useBreakpoint();
	const iconSpaceClass = isSm || isXs ? "space-x-2" : "-space-x-1";
	const iconSize = isSm || isXs ? "xs" : "lg";

	return (
		<TransactionDetail
			data-testid="TransactionMigrationAddress"
			label={t("MIGRATION.POLYGON_ADDRESS")}
			extra={
				<div className={cn("flex items-center", iconSpaceClass)}>
					<EthereumAvatar address={transaction.memo()} size={iconSize} />
				</div>
			}
		>
			<div className="w-0 flex-1 overflow-auto text-right md:text-left">
				<Address
					address={transaction.memo()}
					walletNameClass="text-theme-text"
					alignment={isXs || isSm ? "right" : undefined}
				/>
			</div>
		</TransactionDetail>
	);
};
