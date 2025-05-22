import React from "react";

import { Skeleton } from "@/app/components/Skeleton";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { useTranslation } from "react-i18next";
import { Divider } from "@/app/components/Divider";

export const WalletVoteSkeleton = () => {
	const { t } = useTranslation();

	return (
		<div
			data-testid="WalletVote__skeleton"
			className="flex flex-col rounded-xl border md:bg-transparent md:border-0 dark:bg-black border-theme-secondary-300 bg-theme-secondary-100 md:dark:bg-transparent dark:border-theme-secondary-800"
		>
			<div className="flex items-center py-4 px-8 w-full md:p-0 h-[1.688rem]">
				<div className="flex items-center space-x-2">
					<p className="text-sm font-semibold md:text-base md:leading-5 text-theme-secondary-700 dark:text-theme-dark-200">
						{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.VOTING_FOR")}
					</p>

					<Skeleton height={20} width={67} />
				</div>

				<div className="flex items-center ml-auto space-x-2">
					<p className="text-sm font-semibold md:text-base md:leading-5 text-theme-secondary-700 dark:text-theme-dark-200">
						{t("COMMON.RANK")}
					</p>
					<Skeleton height={20} width={62} />

					<div className="flex items-center space-x-3">
						<Skeleton height={20} width={62} />

						<Divider type="vertical" />

						<Button
							type="button"
							disabled
							variant="secondary"
							className="hidden mt-4 space-x-2 w-full md:flex md:px-2 md:mt-0 md:w-auto disabled:bg-transparent text-theme-primary-600 md:py-[3px] dark:text-theme-dark-navy-400 dark:disabled:bg-transparent"
						>
							<Icon name="Vote" />
							<span>{t("COMMON.VOTE")}</span>
						</Button>
					</div>
				</div>
			</div>

			<div className="flex justify-center py-4 px-6 border-t md:hidden border-theme-secondary-300 dark:border-theme-secondary-800">
				<div className="flex flex-col justify-between items-center h-10">
					<Skeleton height={16} width={150} />
					<Skeleton height={14} width={100} />
				</div>
			</div>
		</div>
	);
};
