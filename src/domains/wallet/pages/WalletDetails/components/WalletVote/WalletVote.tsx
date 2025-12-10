import { EmptyVotes, Votes } from "./WalletVote.blocks";

import { Button } from "@/app/components/Button";
import { Contracts } from "@/app/lib/profiles";
import { Icon } from "@/app/components/Icon";
import React from "react";
import { Tooltip } from "@/app/components/Tooltip";
import { WalletVoteSkeleton } from "./WalletVoteSkeleton";
import { isLedgerWalletCompatible } from "@/utils/wallet-utils";
import { useTranslation } from "react-i18next";

interface WalletVoteProperties {
	wallet: Contracts.IReadWriteWallet | undefined;
	onButtonClick: () => void;
	votes: Contracts.VoteRegistryItem[];
	isLoadingVotes: boolean;
	wallets?: Contracts.IReadWriteWallet[];
}

const DefaultToken = () => (
	<div className="bg-theme-primary-600 flex h-5 w-5 items-center justify-center overflow-hidden rounded-full text-white">
		<span className="text-xs font-semibold">T</span>
	</div>
);

export const WalletVote = ({ wallet, onButtonClick, votes, isLoadingVotes, wallets = [] }: WalletVoteProperties) => {
	const { t } = useTranslation();

	if (isLoadingVotes || !wallet) {
		return <WalletVoteSkeleton />;
	}

	const activeValidators = wallet.network().validatorCount();

	const renderVotes = () => {
		if (wallets.length > 1) {
			return (
				<div className="w-full">
					<p className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 px-[22px] pb-4 text-center text-base font-semibold md:mt-0 md:px-0 md:pb-0 md:text-left">
						{t("WALLETS.PAGE_WALLET_DETAILS.MANAGE_VOTES_FOR_YOUR_ADDRESSES")}
					</p>
				</div>
			);
		}

		if (votes.length === 0) {
			return <EmptyVotes />;
		}

		return <Votes votes={votes} activeValidators={activeValidators} />;
	};

	const tooltipContent = () => {
		if (!wallet.balance()) {
			return t("COMMON.DISABLED_DUE_INSUFFICIENT_BALANCE");
		}

		return isLedgerWalletCompatible(wallet) ? "" : t("COMMON.LEDGER_COMPATIBILITY_ERROR");
	};

	return (
		<div
			data-testid="WalletVote"
			className="-mt-4 flex w-full flex-col items-center md:mt-0 md:flex-row md:items-center"
		>
			{/*{wallets.length === 1 && wallet.tokenCount() > 0*/}(
			<div className="flex w-full items-center gap-1.5">
				<span className="text-theme-secondary-700 leading-5 font-semibold">Token Holdings</span>
				<div className="bg-theme-secondary-200 p flex h-6 items-center rounded-xl">
					<div className="bg-theme-secondary-200 -ml-[5px] flex h-6 w-6 items-center justify-center overflow-hidden rounded-full">
						<DefaultToken />
					</div>
					<div className="bg-theme-secondary-200 -ml-[5px] flex h-6 w-6 items-center justify-center overflow-hidden rounded-full">
						<Icon
							name="ARK"
							dimensions={[16, 16]}
							className="bg-theme-danger-500 flex h-5 w-5 items-center justify-center rounded-full text-white"
						/>
					</div>
					<div className="bg-theme-secondary-200 -ml-[5px] flex h-6 w-6 items-center justify-center overflow-hidden rounded-full">
						<Icon
							name="BPL"
							dimensions={[16, 16]}
							className="bg-theme-info-400 flex h-5 w-5 items-center justify-center rounded-full text-white"
						/>
					</div>
				</div>
			</div>
			){/*: renderVotes()*/}
			{/*}*/}
			<div className="w-full md:w-auto md:max-md:self-end">
				{wallets.length > 1 && (
					<>
						<Button
							data-testid="WalletMyVotes__button"
							variant="secondary-icon"
							className="text-theme-primary-600 dark:text-theme-dark-navy-400 dim:text-theme-dim-navy-600 dim:disabled:bg-transparent mt-4 hidden w-full space-x-2 whitespace-nowrap disabled:bg-transparent md:mt-0 md:flex md:w-auto md:px-2 md:py-[3px] dark:disabled:bg-transparent"
							onClick={() => onButtonClick()}
						>
							<Icon name="Vote" />
							<span>{t("COMMON.MY_VOTES")}</span>
						</Button>

						<Button
							data-testid="WalletMyVotes__button_mobile"
							variant="secondary"
							className="text-theme-primary-600 dim:text-theme-dim-navy-600 w-full disabled:bg-transparent md:hidden dark:text-white dark:disabled:bg-transparent"
							onClick={() => onButtonClick()}
						>
							<Icon name="Vote" />
							<span>{t("COMMON.MY_VOTES")}</span>
						</Button>
					</>
				)}
				{wallets.length === 1 && (
					<Tooltip content={tooltipContent()}>
						<div>
							<Button
								data-testid="WalletVote__button"
								disabled={
									wallet.balance() === 0 ||
									(wallet.network().usesLockedBalance() &&
										wallet.balance("available") < wallet.network().votesAmountStep()) ||
									!wallet.hasBeenFullyRestored() ||
									!wallet.hasSyncedWithNetwork() ||
									!isLedgerWalletCompatible(wallet)
								}
								variant="secondary-icon"
								className="text-theme-primary-600 dark:text-theme-dark-navy-400 dim:text-theme-dim-navy-600 mt-4 hidden w-full space-x-2 disabled:bg-transparent md:mt-0 md:flex md:w-auto md:px-2 md:py-[3px] dark:disabled:bg-transparent"
								onClick={() => onButtonClick()}
							>
								<Icon name="Vote" />
								<span>{t("COMMON.VOTE")}</span>
							</Button>

							<Button
								data-testid="WalletVote__button_mobile"
								disabled={
									wallet.balance() === 0 ||
									(wallet.network().usesLockedBalance() &&
										wallet.balance("available") < wallet.network().votesAmountStep()) ||
									!wallet.hasBeenFullyRestored() ||
									!wallet.hasSyncedWithNetwork() ||
									!isLedgerWalletCompatible(wallet)
								}
								variant="secondary"
								className="text-theme-primary-600 dim:text-theme-dim-navy-600 w-full disabled:bg-transparent md:hidden dark:text-white dark:disabled:bg-transparent"
								onClick={() => onButtonClick()}
							>
								<Icon name="Vote" />
								<span>{t("COMMON.VOTE")}</span>
							</Button>
						</div>
					</Tooltip>
				)}
			</div>
		</div>
	);
};
