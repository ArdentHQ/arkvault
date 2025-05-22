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
			className="flex flex-row justify-start items-center w-full md:justify-start xs:justify-center"
			data-testid="EmptyVotes"
		>
			<div className="pb-4 text-base font-semibold text-center md:px-0 md:pb-0 md:mt-0 md:text-left text-theme-secondary-700 px-[22px] dark:text-theme-dark-200">
				{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.EMPTY_DESCRIPTION")}{" "}
				<Link to={votesHelpLink} isExternal className="inline-flex items-center">
					<span className="text-base leading-5">{t("COMMON.LEARN_MORE")}</span>
				</Link>
			</div>
		</div>
	);
};

export const DelegateStatus = ({ votes, activeValidators }: ValidatorStatusProperties) => {
	const { t } = useTranslation();

	// @ts-ignore
	const activeCount = votes.filter(({ wallet }) => wallet?.rank() <= activeValidators).length;
	const resignedCount = votes.filter(({ wallet }) => wallet?.isResignedValidator()).length;
	const standbyCount = votes.length - activeCount - resignedCount;

	if (activeCount === votes.length) {
		return (
			<Label
				color="success-bg"
				className="flex justify-center items-center py-0.5 text-xs border-none dark:border-solid h-fit w-fit dark:border-theme-success-800"
			>
				{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.ACTIVE", { count: activeCount })}
			</Label>
		);
	}

	if (standbyCount === votes.length) {
		return (
			<Label
				color="warning"
				className="flex justify-center items-center py-0.5 text-xs border-none dark:border-solid h-fit w-fit"
			>
				{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.STANDBY", { count: standbyCount })}
			</Label>
		);
	}

	if (resignedCount === votes.length) {
		return (
			<Label
				color="danger"
				className="flex justify-center items-center py-0.5 text-xs border-none dark:border-solid h-fit w-fit"
				variant="solid"
			>
				{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.RESIGNED", { count: resignedCount })}
			</Label>
		);
	}

	return (
		<Label
			color="neutral"
			className="flex justify-center items-center py-0.5 text-xs border-none dark:border-solid h-fit w-fit"
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

export const DelegateName = ({
	delegateName,
	isUsername,
	className,
}: {
	delegateName: string;
	isUsername: boolean;
	className?: string;
}) => {
	if (!isUsername) {
		return <Address address={delegateName} addressClass={className} showCopyButton={false} />;
	}
	return <AddressLabel className={className}>{delegateName}</AddressLabel>;
};

const Votes = ({ votes, activeValidators }: VotesProperties) => {
	const { t } = useTranslation();

	const validator = votes[0].wallet!;

	return (
		<div className="flex overflow-hidden flex-col gap-0 justify-between items-start mb-3 w-full rounded border md:flex-row md:gap-2 md:items-center md:mb-0 md:rounded-none md:border-none border-theme-secondary-300 dark:border-theme-dark-700">
			<div className="flex flex-row gap-2 items-center p-3 w-full text-sm font-semibold md:p-0 md:w-auto md:text-base md:leading-5 md:bg-transparent bg-theme-secondary-100 leading-[17px] md:dark:bg-transparent dark:bg-theme-dark-950">
				<p className="text-sm md:text-base md:leading-5 text-theme-secondary-700 dark:text-theme-dark-200">
					{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.VOTING_FOR")}
				</p>
				<div className="xs:max-w-32 max-w-28 truncate sm:max-w-40 md:max-w-48">
					<DelegateName
						delegateName={validator.username() || validator.address()}
						className="text-sm md:text-base md:leading-5 dark:text-theme-dark-50"
						isUsername={validator.username() !== undefined}
					/>
				</div>
			</div>

			<div className="flex flex-col gap-2 py-3 px-4 text-base font-semibold leading-5 md:flex-row md:py-0 md:px-0">
				<p className="text-sm md:text-base md:leading-5 text-theme-secondary-700 dark:text-theme-dark-200">
					{t("COMMON.RANK")}
				</p>
				<p className="mb-2 text-sm font-semibold md:mb-0 md:text-base md:leading-5 text-theme-secondary-900 dark:text-theme-dark-50">
					{validator.rank() ? `#${validator.rank()}` : t("COMMON.NOT_AVAILABLE")}
				</p>
				<p className="text-sm md:hidden text-theme-secondary-700 dark:text-theme-dark-200">
					{t("COMMON.DELEGATE_STATUS")}
				</p>
				<DelegateStatus votes={votes} activeValidators={activeValidators} />
				<Divider
					type="vertical"
					className="hidden p-0 mr-3 ml-1 h-5 md:flex border-theme-secondary-300 dark:border-s-theme-dark-700"
				/>
			</div>
		</div>
	);
};

export { EmptyVotes, Votes };
