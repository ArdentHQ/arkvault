import React from "react";
import { useTranslation } from "react-i18next";

import { ValidatorStatusProperties, VotesProperties } from "./WalletVote.contracts";
import { Link } from "@/app/components/Link";
import { Address, AddressLabel } from "@/app/components/Address";
import { Label } from "@/app/components/Label";
import { Divider } from "@/app/components/Divider";
import cn from "classnames";

const votesHelpLink = "https://arkvault.io/docs/transactions/vote";

const EmptyVotes = () => {
	const { t } = useTranslation();
	return (
		<div
			className="flex w-full flex-row items-center justify-start xs:justify-center md:justify-start"
			data-testid="EmptyVotes"
		>
			<div className="px-[22px] pb-4 text-center text-base font-semibold leading-5 text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-dark-200 md:mt-0 md:px-0 md:pb-0 md:text-left">
				<div className="hidden gap-2 sm:flex md-lg:hidden">
					<span>{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.EMPTY_DESCRIPTION_SHORT")} </span>
					<Link to={votesHelpLink} isExternal className="inline-flex items-center">
						<span className="text-base leading-5">{t("COMMON.LEARN")}</span>
					</Link>
				</div>
				<div className="hidden gap-2 md-lg:flex">
					<span>{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.EMPTY_DESCRIPTION")} </span>
					<Link to={votesHelpLink} isExternal className="inline-flex items-center">
						<span className="text-base leading-5">{t("COMMON.LEARN_MORE")}</span>
					</Link>
				</div>
			</div>
		</div>
	);
};

export const ValidatorStatusIcon = ({ votes, activeValidators }: ValidatorStatusProperties) => {
	// @ts-ignore
	const activeCount = votes.filter(({ wallet }) => wallet?.rank() <= activeValidators).length;
	const resignedCount = votes.filter(({ wallet }) => wallet?.isResignedValidator()).length;
	const standbyCount = votes.length - activeCount - resignedCount;

	if (activeCount === votes.length) {
		return (
			<div
				data-testid="ValidatorStatusIcon-Active"
				className="flex h-5 w-5 items-center justify-center rounded-sm border border-transparent bg-theme-success-100 dim:border-theme-success-800 dark:border-theme-success-800 dark:bg-transparent"
			>
				<div className="h-2 w-2 rounded-full border-2 border-theme-success-200 bg-theme-success-700 dim:border-theme-success-700 dim:bg-theme-success-400 dark:border-theme-success-700 dark:bg-theme-success-400" />
			</div>
		);
	}

	if (standbyCount === votes.length) {
		return (
			<div
				data-testid="ValidatorStatusIcon-StandBy"
				className="flex h-5 w-5 items-center justify-center rounded-sm border border-transparent bg-theme-warning-100 dim:border-theme-warning-800 dark:border-theme-warning-800 dark:bg-transparent"
			>
				<div className="h-2 w-2 rounded-full border-2 border-theme-warning-200 bg-theme-warning-700 dim:border-theme-warning-700 dim:bg-theme-warning-400 dark:border-theme-warning-700 dark:bg-theme-warning-400" />
			</div>
		);
	}

	return (
		<div
			data-testid="ValidatorStatusIcon-Resigned"
			className="flex h-5 w-5 items-center justify-center rounded-sm border border-transparent bg-theme-danger-100 dim:border-theme-danger-800 dark:border-theme-danger-800 dark:bg-transparent"
		>
			<div className="h-2 w-2 rounded-full border-2 border-theme-danger-200 bg-theme-danger-700 dim:border-theme-danger-700 dim:bg-theme-danger-400 dark:border-theme-danger-700 dark:bg-theme-danger-400" />
		</div>
	);
};

export const ValidatorStatus = ({ votes, activeValidators }: ValidatorStatusProperties) => {
	const { t } = useTranslation();

	// @ts-ignore
	const activeCount = votes.filter(({ wallet }) => wallet?.rank() <= activeValidators).length;
	const resignedCount = votes.filter(({ wallet }) => wallet?.isResignedValidator()).length;
	const standbyCount = votes.length - activeCount - resignedCount;

	if (activeCount === votes.length) {
		return (
			<Label
				color="success-bg"
				className="flex h-fit w-fit items-center justify-center border-none py-0.5 text-xs dim:border-theme-success-800 dark:border-solid dark:border-theme-success-800"
			>
				{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.ACTIVE", { count: activeCount })}
			</Label>
		);
	}

	if (standbyCount === votes.length) {
		return (
			<Label
				color="warning"
				className="flex h-fit w-fit items-center justify-center border-none py-0.5 text-xs dim:border-solid dark:border-solid"
			>
				{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.STANDBY", { count: standbyCount })}
			</Label>
		);
	}

	if (resignedCount === votes.length) {
		return (
			<Label
				color="danger"
				className="flex h-fit w-fit items-center justify-center border-none py-0.5 text-xs dim:border-solid dark:border-solid"
				variant="solid"
			>
				{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.RESIGNED", { count: resignedCount })}
			</Label>
		);
	}

	return (
		<Label
			color="neutral"
			className="flex h-fit w-fit items-center justify-center border-none py-0.5 text-xs dark:border-solid"
		>
			{
				<span className="font-semibold">
					{activeCount > 0 && t("WALLETS.PAGE_WALLET_DETAILS.VOTES.ACTIVE_COUNT", { count: activeCount })}

					{standbyCount > 0 && (
						<span className="text-theme-secondary-500 dim:text-theme-dim-700 dark:text-theme-secondary-700">
							{activeCount > 0 && " / "}
							{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.STANDBY_COUNT", { count: standbyCount })}
						</span>
					)}

					{resignedCount > 0 && (
						<span className="text-theme-secondary-500 dim:text-theme-dim-700 dark:text-theme-secondary-700">
							{activeCount > 0 && standbyCount > 0 ? " & " : " / "}
							{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.RESIGNED_COUNT", { count: resignedCount })}
						</span>
					)}
				</span>
			}
		</Label>
	);
};

export const ValidatorName = ({
	validatorName,
	isUsername,
	className,
}: {
	validatorName: string;
	isUsername: boolean;
	className?: string;
}) => {
	if (!isUsername) {
		return <Address address={validatorName} addressClass={className} showCopyButton={false} />;
	}
	return <AddressLabel className={className}>{validatorName}</AddressLabel>;
};

const Votes = ({ votes, activeValidators, withDivider, hasTokens }: VotesProperties) => {
	const { t } = useTranslation();

	const validator = votes[0].wallet!;

	return (
		<div className="mb-3 flex w-full flex-col items-start justify-between gap-0 overflow-hidden rounded border border-theme-secondary-300 dim:border-theme-dim-700 dark:border-theme-dark-700 md:mb-0 md:flex-row md:items-center md:gap-2 md:rounded-none md:border-none">
			<div className="flex w-full flex-1 flex-row items-center gap-2 bg-theme-secondary-100 p-3 text-sm font-semibold leading-[17px] dim:bg-theme-dim-950 dark:bg-theme-dark-950 md:w-auto md:bg-transparent md:p-0 md:text-base md:leading-5 md:dim:bg-transparent md:dark:bg-transparent">
				<p className="whitespace-nowrap text-sm text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-dark-200 md:text-base md:leading-5">
					{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.VOTING_FOR")}
				</p>

				<div
					className={cn({
						"max-w-28 flex-1 shrink-0 truncate xs:max-w-32 sm:max-w-40 md:max-w-44": !validator.username(),
						"w-full shrink-0": !!validator.username(),
					})}
				>
					<ValidatorName
						validatorName={validator.username() || validator.address()}
						className="text-sm dim:text-theme-dim-50 dark:text-theme-dark-50 md:text-base md:leading-5"
						isUsername={validator.username() !== undefined}
					/>
				</div>
			</div>

			{withDivider && (
				<Divider
					type="vertical"
					className="ml-1 mr-1 hidden h-5 border-theme-secondary-300 p-0 dim:border-s-theme-dim-700 dark:border-s-theme-dark-700 md-lg:flex"
				/>
			)}

			<div
				className={cn(
					"flex-col gap-2 px-4 py-3 text-base font-semibold leading-5 md:flex-row md:items-center md:px-0 md:py-0",
					{
						flex: !hasTokens,
						"hidden md-lg:flex": hasTokens,
					},
				)}
			>
				<p className="text-sm text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-dark-200 md:text-base md:leading-5">
					{t("COMMON.RANK")}
				</p>
				<p className="mb-2 text-sm font-semibold text-theme-secondary-900 dim:text-theme-dim-50 dark:text-theme-dark-50 md:mb-0 md:text-base md:leading-5">
					{validator.rank() ? `#${validator.rank()}` : t("COMMON.NOT_AVAILABLE")}
				</p>
				<p className="text-sm text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-dark-200 md:hidden">
					{t("COMMON.VALIDATOR_STATUS")}
				</p>
				<ValidatorStatus votes={votes} activeValidators={activeValidators} />
				<Divider
					type="vertical"
					className="ml-1 mr-3 hidden h-5 border-theme-secondary-300 p-0 dim:border-s-theme-dim-700 dark:border-s-theme-dark-700 md:flex"
				/>
			</div>
			<div
				className={cn("status", {
					hidden: !hasTokens,
					"hidden sm:flex md-lg:hidden": hasTokens,
				})}
			>
				<ValidatorStatusIcon votes={votes} activeValidators={activeValidators} />

				<Divider
					type="vertical"
					className="ml-3 mr-1 hidden h-5 border-theme-secondary-300 p-0 dim:border-s-theme-dim-700 dark:border-s-theme-dark-700 md:flex"
				/>
			</div>
		</div>
	);
};

export { EmptyVotes, Votes };
