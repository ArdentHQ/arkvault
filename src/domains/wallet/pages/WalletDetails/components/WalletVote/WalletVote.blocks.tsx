import React from "react";
import { useTranslation } from "react-i18next";

import { DelegateStatusProperties, VotesProperties } from "./WalletVote.contracts";
import { Link } from "@/app/components/Link";
import { AddressLabel } from "@/app/components/Address";
import { Label } from "@/app/components/Label";
import { Divider } from "@/app/components/Divider";

const votesHelpLink = "https://arkvault.io/docs/transactions/vote";

const EmptyVotes = () => {
	const { t } = useTranslation();
	return (
		<div className="flex w-full flex-row items-center justify-start" data-testid="EmptyVotes">
			<div className="flex flex-row gap-2 text-base font-semibold leading-5">
				<p className="text-theme-secondary-700 dark:text-theme-dark-200">
					{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.EMPTY_DESCRIPTION")}
				</p>
				<Link to={votesHelpLink} isExternal>
					<span className="text-base">{t("COMMON.LEARN_MORE")}</span>
				</Link>
			</div>
		</div>
	);
};

const DelegateStatus = ({ votes, activeDelegates }: DelegateStatusProperties) => {
	const { t } = useTranslation();

	// @ts-ignore
	const activeCount = votes.filter(({ wallet }) => wallet?.rank() <= activeDelegates).length;
	const resignedCount = votes.filter(({ wallet }) => wallet?.isResignedDelegate()).length;
	const standbyCount = votes.length - activeCount - resignedCount;

	if (activeCount === votes.length) {
		return (
			<Label
				color="success-bg"
				className="flex h-fit items-center justify-center border-none py-0.5 text-xs dark:border-solid dark:border-theme-success-800"
			>
				{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.ACTIVE", { count: activeCount })}
			</Label>
		);
	}

	if (standbyCount === votes.length) {
		return (
			<Label
				color="warning"
				className="flex h-fit items-center justify-center border-none py-0.5 text-xs dark:border-solid"
			>
				{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.STANDBY", { count: standbyCount })}
			</Label>
		);
	}

	if (resignedCount === votes.length) {
		return (
			<Label
				color="danger"
				className="flex h-fit items-center justify-center border-none py-0.5 text-xs dark:border-solid"
			>
				{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.RESIGNED", { count: resignedCount })}
			</Label>
		);
	}

	return (
		<Label
			color="neutral"
			className="flex h-fit items-center justify-center border-none py-0.5 text-xs dark:border-solid"
		>
			{
				<span className="font-semibold">
					{activeCount > 0 && t("WALLETS.PAGE_WALLET_DETAILS.VOTES.ACTIVE_COUNT", { count: activeCount })}

					{standbyCount > 0 && (
						<span className="text-theme-secondary-500 dark:text-theme-secondary-700">
							{activeCount > 0 && " / "}
							{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.STANDBY_COUNT", { count: standbyCount })}
						</span>
					)}

					{resignedCount > 0 && (
						<span className="text-theme-secondary-500 dark:text-theme-secondary-700">
							{activeCount > 0 && standbyCount > 0 ? " & " : " / "}
							{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.RESIGNED_COUNT", { count: resignedCount })}
						</span>
					)}
				</span>
			}
		</Label>
	);
};

const Votes = ({ votes, activeDelegates }: VotesProperties) => {
	const { t } = useTranslation();

	const validator = votes[0].wallet!;

	return (
		<div className="flex w-full flex-row items-center justify-between gap-2">
			<div className="flex flex-row gap-2 text-base font-semibold leading-5">
				<p className="text-theme-secondary-700 dark:text-theme-dark-200">
					{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.VOTING_FOR")}
				</p>
				<AddressLabel className="max-w-48 truncate dark:text-theme-dark-50">
					{validator.username() || validator.address()}
				</AddressLabel>
			</div>

			<div className="flex flex-row gap-2 text-base font-semibold leading-5">
				<p className="text-theme-secondary-700 dark:text-theme-dark-200">{t("COMMON.RANK")}</p>
				<span className="font-semibold text-theme-secondary-900 dark:text-theme-dark-50">
					{validator.rank() ? `#${validator.rank()}` : t("COMMON.NOT_AVAILABLE")}
				</span>
				<DelegateStatus votes={votes} activeDelegates={activeDelegates} />
				<Divider
					type="vertical"
					className="ml-1 mr-3 h-5 border-theme-secondary-300 p-0 dark:border-s-theme-dark-700"
				/>
			</div>
		</div>
	);
};

export { EmptyVotes, Votes };
