import React from "react";
import { useTranslation } from "react-i18next";

import { ValidatorStatusProperties, VotesProperties } from "./WalletVote.contracts";
import { Link } from "@/app/components/Link";
import { Address, AddressLabel } from "@/app/components/Address";
import { Label } from "@/app/components/Label";
import { Divider } from "@/app/components/Divider";

const votesHelpLink = "https://arkvault.io/docs/transactions/vote";

const EmptyVotes = () => {
	const { t } = useTranslation();
	return (
		<div
			className="xs:justify-center flex w-full flex-row items-center justify-start md:justify-start"
			data-testid="EmptyVotes"
		>
			<div className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 px-[22px] pb-4 text-center text-base font-semibold md:mt-0 md:px-0 md:pb-0 md:text-left">
				{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.EMPTY_DESCRIPTION")}{" "}
				<Link to={votesHelpLink} isExternal className="inline-flex items-center">
					<span className="text-base leading-5">{t("COMMON.LEARN_MORE")}</span>
				</Link>
			</div>
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
				className="dark:border-theme-success-800 dim:border-theme-success-800 flex h-fit w-fit items-center justify-center border-none py-0.5 text-xs dark:border-solid"
			>
				{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.ACTIVE", { count: activeCount })}
			</Label>
		);
	}

	if (standbyCount === votes.length) {
		return (
			<Label
				color="warning"
				className="dim:border-solid flex h-fit w-fit items-center justify-center border-none py-0.5 text-xs dark:border-solid"
			>
				{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.STANDBY", { count: standbyCount })}
			</Label>
		);
	}

	if (resignedCount === votes.length) {
		return (
			<Label
				color="danger"
				className="dim:border-solid flex h-fit w-fit items-center justify-center border-none py-0.5 text-xs dark:border-solid"
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
						<span className="text-theme-secondary-500 dark:text-theme-secondary-700 dim:text-theme-dim-700">
							{activeCount > 0 && " / "}
							{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.STANDBY_COUNT", { count: standbyCount })}
						</span>
					)}

					{resignedCount > 0 && (
						<span className="text-theme-secondary-500 dark:text-theme-secondary-700 dim:text-theme-dim-700">
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

const Votes = ({ votes, activeValidators }: VotesProperties) => {
	const { t } = useTranslation();

	const validator = votes[0].wallet!;

	return (
		<div className="border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 mb-3 flex w-full flex-col items-start justify-between gap-0 overflow-hidden rounded border md:mb-0 md:flex-row md:items-center md:gap-2 md:rounded-none md:border-none">
			<div className="bg-theme-secondary-100 dark:bg-theme-dark-950 dim:bg-theme-dim-950 md:dim:bg-transparent flex w-full flex-1 flex-row items-center gap-2 p-3 text-sm leading-[17px] font-semibold md:w-auto md:bg-transparent md:p-0 md:text-base md:leading-5 md:dark:bg-transparent">
				<p className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 text-sm md:text-base md:leading-5">
					{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.VOTING_FOR")}
				</p>
				<div className="xs:max-w-32 max-w-28 flex-1 truncate sm:max-w-40 md:max-w-60">
					<ValidatorName
						validatorName={validator.username() || validator.address()}
						className="dark:text-theme-dark-50 dim:text-theme-dim-50 text-sm md:text-base md:leading-5"
						isUsername={validator.username() !== undefined}
					/>
				</div>
			</div>

			<div className="flex flex-col gap-2 px-4 py-3 text-base leading-5 font-semibold md:flex-row md:items-center md:px-0 md:py-0">
				<p className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 text-sm md:text-base md:leading-5">
					{t("COMMON.RANK")}
				</p>
				<p className="text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-50 mb-2 text-sm font-semibold md:mb-0 md:text-base md:leading-5">
					{validator.rank() ? `#${validator.rank()}` : t("COMMON.NOT_AVAILABLE")}
				</p>
				<p className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 text-sm md:hidden">
					{t("COMMON.VALIDATOR_STATUS")}
				</p>
				<ValidatorStatus votes={votes} activeValidators={activeValidators} />
				<Divider
					type="vertical"
					className="border-theme-secondary-300 dark:border-s-theme-dark-700 dim:border-s-theme-dim-700 mr-3 ml-1 hidden h-5 p-0 md:flex"
				/>
			</div>
		</div>
	);
};

export { EmptyVotes, Votes };
