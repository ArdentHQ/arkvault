import React from "react";

import { useTranslation } from "react-i18next";
import { DTO } from "@ardenthq/sdk-profiles";

import { Image } from "@/app/components/Image";
import { Icon } from "@/app/components/Icon";
import { NetworkIcon } from "@/domains/network/components/NetworkIcon";
import { Divider } from "@/app/components/Divider";
import { Tooltip } from "@/app/components/Tooltip";

interface Properties {
	transaction: DTO.ExtendedConfirmedTransactionData | DTO.ExtendedSignedTransactionData;
	isCompact: boolean;
	onClick?: () => void;
	showDetailsLink?: boolean;
}

export const TransactionMigrationLink = ({
	transaction,
	children,
	onClick,
}: {
	transaction: DTO.ExtendedConfirmedTransactionData | DTO.ExtendedSignedTransactionData;
	children: React.ReactElement;
	onClick?: () => void;
}) => {
	const clickHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();

		event.stopPropagation();

		onClick?.();
	};

	return (
		<Tooltip content={transaction.id()}>
			<button
				data-testid="TransactionMigrationLink"
				type="button"
				className="link font-semibold"
				onClick={clickHandler}
			>
				<span className="flex items-center space-x-2">
					<span>{children}</span>
					<Icon name="ChevronRight" dimensions={[12, 12]} />
				</span>
			</button>
		</Tooltip>
	);
};

export const TransactionRowMigrationDetails = ({ transaction, isCompact, showDetailsLink, onClick }: Properties) => {
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
						isCompact ? "" : "absolute top-0 h-full w-full"
					}`}
					showTooltip={false}
					noShadow
				/>
			</div>

			<div className="flex items-center">
				<span data-testid="MigrationRowDetailsLabel" className="font-semibold text-theme-text">
					{t("TRANSACTION.MIGRATION")}
				</span>

				{showDetailsLink && (
					<div>
						<Divider type="vertical" />

						<TransactionMigrationLink transaction={transaction} onClick={onClick}>
							<span>{t("TRANSACTION.DETAILS")}</span>
						</TransactionMigrationLink>
					</div>
				)}
			</div>
		</>
	);
};
