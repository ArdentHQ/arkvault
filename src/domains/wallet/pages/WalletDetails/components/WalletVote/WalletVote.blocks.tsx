import React from "react";
import { useTranslation } from "react-i18next";

import { DelegateStatusProperties, VotesProperties } from "./WalletVote.contracts";
import { Link } from "@/app/components/Link";
import { Address, AddressLabel } from "@/app/components/Address";
import { Label } from "@/app/components/Label";
import { Divider } from "@/app/components/Divider";

const votesHelpLink = "https://arkvault.io/docs/transactions/vote";

const EmptyVotes = () => {
	const { t } = useTranslation();
	return (
		<div className="flex w-full flex-row items-center justify-start xs:justify-center md:justify-start" data-testid="EmptyVotes">
			<div className="flex flex-col sm:flex-row items-center gap-2 text-base font-semibold">
				<p className="leading-5 text-theme-secondary-700 dark:text-theme-dark-200 text-center xs:text-left">
					{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.EMPTY_DESCRIPTION")}
				</p>
				<Link to={votesHelpLink} isExternal>
					<span className="text-base leading-5">{t("COMMON.LEARN_MORE")}</span>
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
				className="flex h-fit items-center justify-center border-none py-0.5 text-xs dark:border-solid dark:border-theme-success-800 w-fit"
			>
				{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.ACTIVE", { count: activeCount })}
			</Label>
		);
	}

	if (standbyCount === votes.length) {
		return (
			<Label
				color="warning"
				className="flex h-fit items-center justify-center border-none py-0.5 text-xs dark:border-solid w-fit"
			>
				{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.STANDBY", { count: standbyCount })}
			</Label>
		);
	}

	if (resignedCount === votes.length) {
		return (
			<Label
				color="danger"
				className="flex h-fit items-center justify-center border-none py-0.5 text-xs dark:border-solid w-fit"
			>
				{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.RESIGNED", { count: resignedCount })}
			</Label>
		);
	}

	return (
		<Label
			color="neutral"
			className="flex h-fit items-center justify-center border-none py-0.5 text-xs dark:border-solid w-fit"
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

const DelegateName = ({ delegateName, isUsername, className }: { delegateName: string; isUsername: boolean, className?: string }) => {
	if (!isUsername) {
		return (
			<Address
				address={delegateName}
				addressClass={className}
				showCopyButton={false}
			/>
		)
	}
	return (
		<AddressLabel className={className}>
			{delegateName}
		</AddressLabel>
	)
}

const Votes = ({ votes, activeDelegates }: VotesProperties) => {
	const { t } = useTranslation();

	const validator = votes[0].wallet!;

	return (
		<div className="flex w-full flex-col md:flex-row items-start md:items-center justify-between gap-0 md:gap-2 border border-theme-secondary-300 dark:border-theme-dark-700 md:border-none rounded md:rounded-none overflow-hidden mb-3 md:mb-0">
			<div className="flex flex-row items-center gap-2 text-sm md:text-base font-semibold leading-[17px] md:leading-5 bg-theme-secondary-100 md:bg-transparent dark:bg-theme-dark-950 w-full md:w-auto p-3 md:p-0">
				<p className="text-theme-secondary-700 dark:text-theme-dark-200 text-sm md:text-base md:leading-5">
					{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.VOTING_FOR")}
				</p>
				<div className="max-w-28 xs:max-w-32 sm:max-w-40 md:max-w-48 truncate ">
					<DelegateName delegateName={validator.username() || validator.address()} className="dark:text-theme-dark-50 text-sm md:text-base md:leading-5" isUsername={validator.username() !== undefined} />
				</div>
			</div>

			<div className="flex flex-col md:flex-row gap-2 text-base font-semibold leading-5 px-4 py-3 md:px-0 md:py-0">
				<p className="text-theme-secondary-700 dark:text-theme-dark-200 text-sm md:text-base md:leading-5">{t("COMMON.RANK")}</p>
				<p className="font-semibold text-theme-secondary-900 dark:text-theme-dark-50 mb-2 md:mb-0 text-sm md:text-base md:leading-5">
					{validator.rank() ? `#${validator.rank()}` : t("COMMON.NOT_AVAILABLE")}
				</p>
				<p className="text-theme-secondary-700 dark:text-theme-dark-200 text-sm md:hidden">{t("COMMON.DELEGATE_STATUS")}</p>
				<DelegateStatus votes={votes} activeDelegates={activeDelegates} />
				<Divider
					type="vertical"
					className="hidden md:flex ml-1 mr-3 h-5 border-theme-secondary-300 p-0 dark:border-s-theme-dark-700"
				/>
			</div>
		</div>
	);
};

export { EmptyVotes, Votes };
