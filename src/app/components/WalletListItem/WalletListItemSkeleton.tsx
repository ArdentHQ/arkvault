import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { Skeleton } from "@/app/components/Skeleton";

import { TableCell, TableRow } from "@/app/components/Table";

export const WalletListItemSkeleton: React.VFC = () => {
	const { t } = useTranslation();

	return (
		<TableRow>
			<TableCell variant="start" size="sm" innerClassName="flex shrink-0">
				<div className="flex h-5 items-center border-r border-theme-secondary-300 pr-3 dark:border-theme-secondary-800">
					<Skeleton height={18} width={18} />
				</div>
			</TableCell>

			<TableCell innerClassName="-ml-3 space-x-3">
				<Skeleton circle height={20} width={20} /> : <Skeleton circle height={44} width={44} />
				<Skeleton height={16} width={200} />
			</TableCell>

			<TableCell innerClassName="justify-center">
				<></>
			</TableCell>

			<TableCell innerClassName="justify-end">
				<Skeleton height={16} width={150} />
			</TableCell>

			<TableCell innerClassName="justify-end">
				<Skeleton height={16} width={100} />
			</TableCell>

			<TableCell variant="end" size="sm" innerClassName="justify-end text-theme-secondary-text">
				<Button
					size="icon"
					data-testid="WalletHeader__send-button"
					disabled={true}
					variant="transparent"
					className="-mr-3 text-theme-primary-600 hover:text-theme-primary-700"
				>
					{t("COMMON.SEND")}
				</Button>

				<div data-testid="WalletHeader__more-button" className="ml-3">
					<Button
						variant="transparent"
						size="icon"
						disabled={true}
						className="-mr-1.5 text-theme-gray-700 hover:bg-theme-primary-200 hover:text-theme-primary-700 dark:hover:bg-theme-secondary-800 dark:hover:text-white"
					>
						<Icon name="EllipsisVertical" size="md" />
					</Button>
				</div>
			</TableCell>
		</TableRow>
	);
};
