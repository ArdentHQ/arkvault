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
		<div
			className="flex w-full flex-row items-center justify-start xs:justify-center md:justify-start"
			data-testid="EmptyVotes"
		>
			<p className="px-[22px] pb-4 text-center text-base font-semibold text-theme-secondary-700 dark:text-theme-dark-200 md:mt-0 md:px-0 md:pb-0 md:text-left">
				{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.EMPTY_DESCRIPTION")}{" "}
				<Link to={votesHelpLink} isExternal className="inline-flex items-center">
					<span className="text-base leading-5">{t("COMMON.LEARN_MORE")}</span>
				</Link>
			</p>
		</div>
	);
};

export const DelegateStatus = ({ votes, activeDelegates }: DelegateStatusProperties) => {
	const { t } = useTranslation();

	// @ts-ignore
	const activeCount = votes.filter(({ wallet }) => wallet?.rank() <= activeDelegates).length;
	const resignedCount = votes.filter(({ wallet }) => wallet?.isResignedDelegate()).length;
	const standbyCount = votes.length - activeCount - resignedCount;

	if (activeCount === votes.length) {
		return (
			<Label
				color="success-bg"
				className="flex h-fit w-fit items-center justify-center border-none py-0.5 text-xs dark:border-solid dark:border-theme-success-800"
			>
				{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.ACTIVE", { count: activeCount })}
			</Label>
		);
	}

	if (standbyCount === votes.length) {
		return (
			<Label
				color="warning"
				className="flex h-fit w-fit items-center justify-center border-none py-0.5 text-xs dark:border-solid"
			>
				{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.STANDBY", { count: standbyCount })}
			</Label>
		);
	}

	if (resignedCount === votes.length) {
		return (
			<Label
				color="danger"
				className="flex h-fit w-fit items-center justify-center border-none py-0.5 text-xs dark:border-solid"
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

const Votes = ({ votes, activeDelegates }: VotesProperties) => {
	const { t } = useTranslation();

	const validator = votes[0].wallet!;

	return (
		<div className="mb-3 flex w-full flex-col items-start justify-between gap-0 overflow-hidden rounded border border-theme-secondary-300 dark:border-theme-dark-700 md:mb-0 md:flex-row md:items-center md:gap-2 md:rounded-none md:border-none">
			<div className="flex w-full flex-row items-center gap-2 bg-theme-secondary-100 p-3 text-sm font-semibold leading-[17px] dark:bg-theme-dark-950 md:w-auto md:bg-transparent md:p-0 md:text-base md:leading-5 md:dark:bg-transparent">
				<p className="text-sm text-theme-secondary-700 dark:text-theme-dark-200 md:text-base md:leading-5">
					{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.VOTING_FOR")}
				</p>
				<div className="max-w-28 truncate xs:max-w-32 sm:max-w-40 md:max-w-48">
					<DelegateName
						delegateName={validator.username() || validator.address()}
						className="text-sm dark:text-theme-dark-50 md:text-base md:leading-5"
						isUsername={validator.username() !== undefined}
					/>
				</div>
			</div>

			<div className="flex flex-col gap-2 px-4 py-3 text-base font-semibold leading-5 md:flex-row md:px-0 md:py-0">
				<p className="text-sm text-theme-secondary-700 dark:text-theme-dark-200 md:text-base md:leading-5">
					{t("COMMON.RANK")}
				</p>
				<p className="mb-2 text-sm font-semibold text-theme-secondary-900 dark:text-theme-dark-50 md:mb-0 md:text-base md:leading-5">
					{validator.rank() ? `#${validator.rank()}` : t("COMMON.NOT_AVAILABLE")}
				</p>
				<p className="text-sm text-theme-secondary-700 dark:text-theme-dark-200 md:hidden">
					{t("COMMON.DELEGATE_STATUS")}
				</p>
				<DelegateStatus votes={votes} activeDelegates={activeDelegates} />
				<Divider
					type="vertical"
					className="ml-1 mr-3 hidden h-5 border-theme-secondary-300 p-0 dark:border-s-theme-dark-700 md:flex"
				/>
			</div>
		</div>
	);
};

export { EmptyVotes, Votes };
