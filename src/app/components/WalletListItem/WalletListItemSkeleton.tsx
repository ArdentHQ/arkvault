import cn from "classnames";
import React from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { Skeleton } from "@/app/components/Skeleton";
import { TableCell, TableRow } from "@/app/components/Table";
import { WalletListItemSkeletonProperties } from "@/app/components/WalletListItem/WalletListItem.contracts";

export const WalletListItemSkeleton: React.VFC<WalletListItemSkeletonProperties> = ({ isCompact }) => {
	const { t } = useTranslation();

	return (
		<TableRow>
			<TableCell variant="start" size="sm" isCompact={isCompact} innerClassName="flex shrink-0">
				<div
					className={cn(
						"flex items-center border-r border-theme-secondary-300 pr-3 dark:border-theme-secondary-800",
						isCompact ? "h-5" : "h-11",
					)}
				>
					<Skeleton height={18} width={18} />
				</div>
			</TableCell>

			<TableCell innerClassName={cn("-ml-3", isCompact ? "space-x-3" : "space-x-4")} isCompact={isCompact}>
				{isCompact ? <Skeleton circle height={20} width={20} /> : <Skeleton circle height={44} width={44} />}

				<Skeleton height={16} width={200} />
			</TableCell>

			<TableCell innerClassName="justify-center" isCompact={isCompact}>
				<></>
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
