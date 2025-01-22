import React from "react";

import { Skeleton } from "@/app/components/Skeleton";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { useTranslation } from "react-i18next";
import { Divider } from "@/app/components/Divider";

export const WalletVoteSkeleton = () => {
	const { t } = useTranslation()

	return (
		<div
			data-testid="WalletVote__skeleton"
			className="flex flex-col rounded-xl border border-theme-secondary-300 bg-theme-secondary-100 dark:border-theme-secondary-800 dark:bg-black md:border-0 md:bg-transparent md:dark:bg-transparent"
		>
			<div className="flex h-[1.688rem] w-full items-center px-8 py-4 md:p-0">
				<div className="flex space-x-2 items-center">
					<p className="text-sm text-theme-secondary-700 dark:text-theme-dark-200 md:text-base md:leading-5 font-semibold">
						{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.VOTING_FOR")}
					</p>

					<Skeleton height={20} width={67} />
				</div>

				<div className="flex items-center space-x-2 ml-auto">
					<p className="text-sm text-theme-secondary-700 dark:text-theme-dark-200 md:text-base md:leading-5 font-semibold">
						{t("COMMON.RANK")}
					</p>
					<Skeleton height={20} width={62} />

					<div className="flex space-x-3 items-center">
						<Skeleton height={20} width={62} />

						<Divider type="vertical" />

						<Button
							type="button"
							disabled
							variant="secondary"
							className="mt-4 hidden w-full space-x-2 text-theme-primary-600 dark:text-theme-dark-navy-400 md:mt-0 md:flex md:w-auto md:px-2 md:py-[3px] dark:disabled:bg-transparent disabled:bg-transparent"
						>
							<Icon name="Vote" />
							<span>{t("COMMON.VOTE")}</span>
						</Button>

					</div>
				</div>
			</div>

			<div className="flex justify-center border-t border-theme-secondary-300 px-6 py-4 dark:border-theme-secondary-800 md:hidden">
				<div className="flex h-10 flex-col items-center justify-between">
					<Skeleton height={16} width={150} />
					<Skeleton height={14} width={100} />
				</div>
			</div>
		</div>
	)
};
