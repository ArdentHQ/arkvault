import React from "react";

import { useTranslation } from "react-i18next";
import { DTO } from "@ardenthq/sdk-profiles";

import { Image } from "@/app/components/Image";
import { Link } from "@/app/components/Link";
import { Icon } from "@/app/components/Icon";
import { NetworkIcon } from "@/domains/network/components/NetworkIcon";
import { Divider } from "@/app/components/Divider";

interface Properties {
	transaction: DTO.ExtendedConfirmedTransactionData;
	isCompact: boolean;
}

export const TransactionMigrationLink = ({
	transaction,
	children,
}: {
	transaction: DTO.ExtendedConfirmedTransactionData;
	children: React.ReactElement;
}) => {
	return (
		<Link to={transaction.explorerLink()} tooltip={transaction.id()} showExternalIcon={false} isExternal>
			<span className="flex items-center space-x-2">
				<span>{children}</span>
				<Icon name="ChevronRight" size="md" />
			</span>
		</Link>
	);
};

export const TransactionRowMigrationDetails = ({ transaction, isCompact }: Properties) => {
	const { t } = useTranslation();

	return (
		<>
			<div className="relative flex items-center">
				{!isCompact && <Image name="HexagonBold" width={44} height={44} useAccentColor={false} />}

				<NetworkIcon
					isCompact={isCompact}
					network={transaction.wallet().network()}
					size="lg"
					className={`border-transparent text-theme-hint-600 ${
						!isCompact ? "absolute top-0 h-full w-full" : ""
					}`}
					noShadow
					tooltipDarkTheme
				/>
			</div>

			<div className="flex items-center">
				<span data-testid="MigrationRowDetailsLabel" className="font-semibold text-theme-text">
					{t("TRANSACTION.MIGRATION")}
				</span>

				<Divider type="vertical" />

				<TransactionMigrationLink transaction={transaction}>
					<span>{t("TRANSACTION.DETAILS")}</span>
				</TransactionMigrationLink>
			</div>
		</>
	);
};
