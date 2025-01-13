import React from "react";
import { useTranslation } from "react-i18next";

import { DelegateStatusProperties, EmptyVotesProperties, VotesProperties } from "./WalletVote.contracts";
import { Amount } from "@/app/components/Amount";
import { Circle } from "@/app/components/Circle";
import { Icon } from "@/app/components/Icon";
import { Link } from "@/app/components/Link";
import { AddressLabel } from "@/app/components/Address";
import { Label } from "@/app/components/Label";
import { Divider } from "@/app/components/Divider";

const votesHelpLink = "https://arkvault.io/docs/transactions/vote";

const EmptyVotes = ({ wallet }: EmptyVotesProperties) => {
	const { t } = useTranslation();
	const maxVotes = wallet.network().maximumVotesPerWallet();

	return (
		<div className="flex flex-1 items-center space-x-4">
			<div className="hidden md:block">
				<Circle
					size="lg"
					className="border-theme-secondary-500 text-theme-secondary-500 dark:border-theme-secondary-700 dark:text-theme-secondary-700"
					shadowClassName="ring-theme-background dark:ring-theme-secondary-background"
				>
					<Icon name="Vote" size="lg" />
				</Circle>
			</div>

			<div className="flex flex-col justify-between space-y-2 text-center md:space-y-0 md:text-left">
				<span className="font-semibold">
					{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.TITLE", { count: maxVotes })}
					<span className="ml-1 text-theme-secondary-500 dark:text-theme-secondary-700">0/{maxVotes}</span>
				</span>

				<span className="flex flex-col space-y-2 leading-none md:flex-row md:space-y-0">
					<span className="mr-1 text-sm text-theme-secondary-500 dark:text-theme-secondary-700">
						{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.EMPTY_DESCRIPTION")}
					</span>
					<Link to={votesHelpLink} isExternal>
						<span className="text-sm">{t("COMMON.LEARN_MORE")}</span>
					</Link>
				</span>
			</div>

			{wallet.network().usesLockedBalance() && (
				<div className="ml-4 flex">
					<div className="ml-6 flex flex-col justify-between border-l border-theme-secondary-300 pl-6 font-semibold dark:border-theme-secondary-800">
						<span className="text-sm text-theme-secondary-500 dark:text-theme-secondary-700">
							{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.LOCKED_VOTES")}
						</span>
						<Amount value={0} ticker={wallet.currency()} />
					</div>

					<div className="ml-6 flex flex-col justify-between border-l border-theme-secondary-300 pl-6 font-semibold dark:border-theme-secondary-800">
						<span className="text-sm text-theme-secondary-500 dark:text-theme-secondary-700">
							{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.LOCKED_UNVOTES")}
						</span>
						<Amount value={0} ticker={wallet.currency()} />
					</div>
				</div>
			)}
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
			<Label color="success-bg" className="flex h-fit items-center justify-center border-none py-0.5 text-xs">
				{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.ACTIVE", { count: activeCount })}
			</Label>
		);
	}

	if (standbyCount === votes.length) {
		return (
			<Label color="warning" className="flex h-fit items-center justify-center border-none py-0.5 text-xs">
				{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.STANDBY", { count: standbyCount })}
			</Label>
		);
	}

	if (resignedCount === votes.length) {
		return (
			<Label color="danger" className="flex h-fit items-center justify-center border-none py-0.5 text-xs">
				{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.RESIGNED", { count: resignedCount })}
			</Label>
		);
	}

	return (
		<Label color="neutral" className="flex h-fit items-center justify-center border-none py-0.5 text-xs">
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
				<p className="text-theme-secondary-700">{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.VOTING_FOR")}</p>
				<AddressLabel className="max-w-48 truncate">{validator.username() || validator.address()}</AddressLabel>
			</div>

			<div className="flex flex-row gap-2 text-base font-semibold leading-5">
				<p className="text-theme-secondary-700">{t("COMMON.RANK")}</p>
				<span className="font-semibold text-theme-secondary-900">
					{validator.rank() ? `#${validator.rank()}` : t("COMMON.NOT_AVAILABLE")}
				</span>
				<DelegateStatus votes={votes} activeDelegates={activeDelegates} />
				<Divider type="vertical" className="ml-1 mr-3 h-5 border-theme-secondary-300 p-0" />
			</div>
		</div>
	);
};

export { EmptyVotes, Votes };
