import { DateTime } from "@ardenthq/sdk-intl";
import cn from "classnames";
import React from "react";

import { AmountLabel } from "@/app/components/Amount";
import { Circle } from "@/app/components/Circle";
import { Icon } from "@/app/components/Icon";
import { TableCell, TableRow } from "@/app/components/Table";
import { Tooltip } from "@/app/components/Tooltip";
import { useTimeFormat } from "@/app/hooks/use-time-format";
import { Button } from "@/app/components/Button";
import { Address } from "@/app/components/Address";
import { EthereumAvatar } from "@/app/components/Avatar";

interface MigrationTransactionsRowStatusProperties {
	status: any;
}

const MigrationTransactionsRowStatus: React.FC<{ status: any }> = ({
	status,
}: MigrationTransactionsRowStatusProperties) => {
	return (
		<Tooltip content="confirmed">
			<span>
				<Icon name="CircleCheckMark" size="lg" className="text-theme-success-600" />
			</span>
		</Tooltip>
	);
};

interface MigrationTransactionsRowProperties {
	migrationTransaction: any;
	isCompact: boolean;
	onClick: () => void;
}

export const MigrationTransactionsRow = ({
	migrationTransaction,
	isCompact,
	onClick,
}: MigrationTransactionsRowProperties) => {
	const timeFormat = useTimeFormat();

	return (
		<TableRow>
			<TableCell variant="start" isCompact={isCompact}>
				<Tooltip content="id" className="no-ligatures">
					<span className="flex items-center">
						<button type="button" className="link" onClick={() => console.log("glass click")}>
							<Icon name="MagnifyingGlassId" />
						</button>
					</span>
				</Tooltip>
			</TableCell>

			<TableCell className="hidden lg:table-cell" isCompact={isCompact}>
				{DateTime.fromUnix(Date.now() / 1000).format(timeFormat)}
			</TableCell>

			<TableCell innerClassName="gap-3" isCompact={isCompact}>
				{isCompact && (
					<span className="hidden h-5 w-5 items-center border-theme-danger-100 text-theme-danger-400 dark:border-theme-danger-400 lg:flex">
						<Icon name="Sent" size="lg" />
					</span>
				)}

				{!isCompact && (
					<div className="hidden lg:flex">
						<Circle
							size="lg"
							className="border-theme-danger-100 text-theme-danger-400 dark:border-theme-danger-400"
						>
							<Icon name="Sent" size="lg" />
						</Circle>
					</div>
				)}

				<div className="w-0 flex-1">
					<Address address="address" />
				</div>
			</TableCell>

			<TableCell innerClassName="gap-3" isCompact={isCompact}>
				<EthereumAvatar address="address" size={isCompact ? "xs" : "lg"} />
				<div className="w-0 flex-1">
					<Address address="address" />
				</div>
			</TableCell>

			<TableCell innerClassName="justify-center" isCompact={isCompact}>
				<MigrationTransactionsRowStatus status={undefined} />
			</TableCell>

			<TableCell isCompact={isCompact}>
				<AmountLabel value={1} ticker="ARK" isCompact={isCompact} isNegative />
			</TableCell>

			<TableCell variant="end" innerClassName="justify-end text-theme-secondary-text" isCompact={isCompact}>
				<Button
					variant={isCompact ? "transparent" : "secondary"}
					size={isCompact ? "icon" : undefined}
					disabled={true}
					className={cn("whitespace-nowrap", {
						"my-auto": !isCompact,
						"text-theme-primary-600 hover:text-theme-primary-700": isCompact,
					})}
					onClick={onClick}
				>
					View Details
				</Button>
			</TableCell>
		</TableRow>
	);
};
