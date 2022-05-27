import cn from "classnames";
import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { WalletListItemSkeletonProperties } from "@/app/components/WalletListItem/WalletListItem.contracts";
import { Skeleton } from "@/app/components/Skeleton";

import { Circle } from "@/app/components/Circle";
import { TableCell, TableRow } from "@/app/components/Table";

export const WalletListItemSkeleton: React.VFC<WalletListItemSkeletonProperties> = ({ isCompact }) => {
	const { t } = useTranslation();

	return (
		<TableRow>
			<TableCell
				variant="start"
				size="sm"
				innerClassName={cn("items-center", isCompact ? "space-x-3" : "space-x-4")}
				isCompact={isCompact}
			>
				<Skeleton height={18} width={18} />

				<div
					className={cn(
						"flex items-center border-l border-theme-secondary-300 dark:border-theme-secondary-800",
						{
							"ml-3 space-x-3 pl-3": isCompact,
							"ml-4 space-x-4 pl-4": !isCompact,
						},
					)}
				>
					{isCompact ? (
						<Circle className="border-transparent" size="xs">
							<Skeleton circle height={20} width={20} />
						</Circle>
					) : (
						<Circle className="border-transparent" size="lg">
							<Skeleton circle height={44} width={44} />
						</Circle>
					)}
				</div>

				<Skeleton height={16} width={200} />
			</TableCell>

			<TableCell innerClassName="justify-center" isCompact={isCompact}>
				<Skeleton height={16} width={100} />
			</TableCell>

			<TableCell innerClassName="justify-end" isCompact={isCompact}>
				<Skeleton height={16} width={150} />
			</TableCell>

			<TableCell innerClassName="justify-end" isCompact={isCompact}>
				<Skeleton height={16} width={100} />
			</TableCell>

			<TableCell
				variant="end"
				size="sm"
				innerClassName="justify-end text-theme-secondary-text"
				isCompact={isCompact}
			>
				<Button
					size={isCompact ? "icon" : undefined}
					data-testid="WalletHeader__send-button"
					disabled={true}
					variant={isCompact ? "transparent" : "secondary"}
					className={cn("ml-3", {
						"-mr-3 text-theme-primary-600 hover:text-theme-primary-700": isCompact,
						"my-auto": !isCompact,
					})}
				>
					{t("COMMON.SEND")}
				</Button>

				<div data-testid="WalletHeader__more-button" className="ml-3">
					<Button
						variant={isCompact ? "transparent" : "secondary"}
						size={isCompact ? "icon" : undefined}
						disabled={true}
						className={cn("w-11", {
							"-mr-1.5 text-theme-primary-300 hover:text-theme-primary-600": isCompact,
							"flex-1 bg-theme-primary-600 text-white hover:bg-theme-primary-700": !isCompact,
						})}
					>
						<Icon name="EllipsisVertical" size="lg" />
					</Button>
				</div>
			</TableCell>
		</TableRow>
	);
};
