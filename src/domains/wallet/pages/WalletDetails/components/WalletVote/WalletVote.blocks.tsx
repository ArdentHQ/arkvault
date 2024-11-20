import React from "react";
import { useTranslation } from "react-i18next";

import { DelegateStatusProperties, EmptyVotesProperties, VotesProperties } from "./WalletVote.contracts";
import { Amount } from "@/app/components/Amount";
import { Circle } from "@/app/components/Circle";
import { Icon } from "@/app/components/Icon";
import { Link } from "@/app/components/Link";
import { Tooltip } from "@/app/components/Tooltip";

const votesHelpLink = "https://arkvault.io/docs/transactions/vote";

const HintIcon = ({ tooltipContent }: { tooltipContent: string }) => (
	<Tooltip content={tooltipContent} className="mb-1">
		<span className="flex h-5 w-5 items-center justify-center rounded-full bg-theme-primary-100 text-theme-primary-600 transition-colors hover:bg-theme-primary-600 hover:text-theme-primary-100 dark:bg-theme-secondary-800 dark:text-theme-secondary-200">
			<Icon name="HintSmall" size="sm" />
		</span>
	</Tooltip>
);

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

	const renderStatuses = () => {
		if (activeCount === votes.length) {
			return (
				<span className="font-semibold text-theme-primary-600">
					{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.ACTIVE", {
						count: activeCount,
					})}
				</span>
			);
		}

		if (standbyCount === votes.length) {
			return (
				<>
					<HintIcon
						tooltipContent={t("WALLETS.PAGE_WALLET_DETAILS.VOTES.NOT_FORGING_COUNT", {
							count: standbyCount,
						})}
					/>

					<span className="font-semibold text-theme-warning-500">
						{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.STANDBY", {
							count: standbyCount,
						})}
					</span>
				</>
			);
		}

		if (resignedCount === votes.length) {
			return (
				<>
					<HintIcon
						tooltipContent={t("WALLETS.PAGE_WALLET_DETAILS.VOTES.NOT_FORGING_COUNT", {
							count: resignedCount,
						})}
					/>

					<span className="font-semibold text-theme-danger-400">
						{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.RESIGNED", { count: resignedCount })}
					</span>
				</>
			);
		}

		return (
			<>
				<HintIcon
					tooltipContent={t("WALLETS.PAGE_WALLET_DETAILS.VOTES.NOT_FORGING_COUNT", {
						count: standbyCount + resignedCount,
					})}
				/>

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
			</>
		);
	};

	return (
		<div className="flex flex-col items-center justify-between border-theme-secondary-300 px-6 py-4 font-semibold dark:border-theme-secondary-800 md:mr-6 md:items-end md:border-r md:py-0 md:pl-0 md:pr-6">
			<span className="text-sm text-theme-secondary-500 dark:text-theme-secondary-700">
				{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.VALIDATOR_STATUS")}
			</span>
			<div className="flex items-center justify-end space-x-2">{renderStatuses()}</div>
		</div>
	);
};

const Votes = ({ wallet, votes, activeDelegates, onButtonClick }: VotesProperties) => {
	const { t } = useTranslation();

	const delegate = votes[0].wallet!;
	const maxVotes = wallet.network().maximumVotesPerWallet();

	return (
		<div className="flex w-full flex-grow flex-col overflow-hidden rounded-xl border border-theme-secondary-300 dark:border-theme-secondary-800 md:w-auto md:flex-row md:rounded-none md:border-0">
			<div className="hidden md:block">
				<Circle
					size="lg"
					className="border-theme-secondary-900 text-theme-secondary-900 dark:border-theme-secondary-700 dark:text-theme-secondary-700"
					shadowClassName="ring-theme-background dark:ring-theme-secondary-background"
				>
					<Icon name="Vote" size="lg" />
				</Circle>
			</div>

			<div className="flex flex-1 border-b border-theme-secondary-300 bg-theme-secondary-100 px-6 py-4 dark:border-theme-secondary-800 dark:bg-black md:ml-4 md:border-none md:bg-transparent md:p-0">
				<div className="flex flex-grow flex-col justify-between font-semibold md:flex-grow-0">
					<span className="text-sm text-theme-secondary-500 dark:text-theme-secondary-700">
						{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.VOTING_FOR")}
					</span>

					{votes.length === 1 ? (
						<span>{delegate.username()}</span>
					) : (
						<span
							className="cursor-pointer text-theme-primary-600 transition-colors duration-200 hover:text-theme-primary-700 active:text-theme-primary-500"
							onClick={() => onButtonClick("current")}
						>
							{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.MULTIVOTE")}
						</span>
					)}
				</div>

				{maxVotes === 1 && (
					<div className="ml-6 flex flex-col justify-between border-l border-theme-secondary-300 pl-6 font-semibold dark:border-theme-secondary-800">
						<span className="text-sm text-theme-secondary-500 dark:text-theme-secondary-700">
							{t("COMMON.RANK")}
						</span>
						<span>{delegate.rank() ? `#${delegate.rank()}` : t("COMMON.NOT_AVAILABLE")}</span>
					</div>
				)}

				{maxVotes > 1 && (
					<div className="ml-6 flex flex-col justify-between border-l border-theme-secondary-300 pl-6 font-semibold dark:border-theme-secondary-800">
						<span className="text-sm text-theme-secondary-500 dark:text-theme-secondary-700">
							{t("COMMON.VOTES")}
						</span>
						<span>
							{votes.length}
							<span className="text-theme-secondary-500 dark:text-theme-secondary-700">/{maxVotes}</span>
						</span>
					</div>
				)}

				{wallet.network().usesLockedBalance() && (
					<>
						<div
							data-testid="Votes--lockedvotes"
							className="ml-6 flex flex-col justify-between border-l border-theme-secondary-300 pl-6 font-semibold dark:border-theme-secondary-800"
						>
							<span className="text-sm text-theme-secondary-500 dark:text-theme-secondary-700">
								{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.LOCKED_VOTES")}
							</span>
							<Amount value={wallet.balance("lockedVotes")} ticker={wallet.currency()} />
						</div>

						<div className="ml-6 flex flex-col justify-between border-l border-theme-secondary-300 pl-6 font-semibold dark:border-theme-secondary-800">
							<span className="text-sm text-theme-secondary-500 dark:text-theme-secondary-700">
								{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.LOCKED_UNVOTES")}
							</span>
							<Amount value={wallet.balance("lockedUnvotes")} ticker={wallet.currency()} />
						</div>
					</>
				)}
			</div>

			<DelegateStatus votes={votes} activeDelegates={activeDelegates} />
		</div>
	);
};

export { EmptyVotes, Votes };
