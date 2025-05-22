import { Contracts } from "@/app/lib/profiles";
import React from "react";
import { useTranslation } from "react-i18next";
import { EmptyVotes, Votes } from "./WalletVote.blocks";
import { WalletVoteSkeleton } from "./WalletVoteSkeleton";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { isLedgerWalletCompatible } from "@/utils/wallet-utils";
import { Tooltip } from "@/app/components/Tooltip";

interface WalletVoteProperties {
	wallet: Contracts.IReadWriteWallet | undefined;
	onButtonClick: () => void;
	votes: Contracts.VoteRegistryItem[];
	isLoadingVotes: boolean;
	wallets?: Contracts.IReadWriteWallet[];
}

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
					<p className="pb-4 text-base font-semibold text-center md:px-0 md:pb-0 md:mt-0 md:text-left text-theme-secondary-700 px-[22px] dark:text-theme-dark-200">
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

	return (
		<div
			data-testid="WalletVote"
			className="flex flex-col items-center -mt-4 w-full md:flex-row md:items-center md:mt-0"
		>
			{renderVotes()}

			<Tooltip content={isLedgerWalletCompatible(wallet) ? "" : t("COMMON.LEDGER_COMPATIBILITY_ERROR")}>
				<div className="w-full md:w-auto md:max-md:self-end">
					{wallets.length > 1 && (
						<>
							<Button
								data-testid="WalletMyVotes__button"
								variant="secondary-icon"
								className="hidden mt-4 space-x-2 w-full whitespace-nowrap md:flex md:px-2 md:mt-0 md:w-auto disabled:bg-transparent text-theme-primary-600 md:py-[3px] dark:text-theme-dark-navy-400 dark:disabled:bg-transparent"
								onClick={() => onButtonClick()}
							>
								<Icon name="Vote" />
								<span>{t("COMMON.MY_VOTES")}</span>
							</Button>

							<Button
								data-testid="WalletMyVotes__button_mobile"
								variant="secondary"
								className="w-full md:hidden dark:text-white disabled:bg-transparent text-theme-primary-600 dark:disabled:bg-transparent"
								onClick={() => onButtonClick()}
							>
								<Icon name="Vote" />
								<span>{t("COMMON.MY_VOTES")}</span>
							</Button>
						</>
					)}
					{wallets.length === 1 && (
						<>
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
								className="hidden mt-4 space-x-2 w-full md:flex md:px-2 md:mt-0 md:w-auto disabled:bg-transparent text-theme-primary-600 md:py-[3px] dark:text-theme-dark-navy-400 dark:disabled:bg-transparent"
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
								className="w-full md:hidden dark:text-white disabled:bg-transparent text-theme-primary-600 dark:disabled:bg-transparent"
								onClick={() => onButtonClick()}
							>
								<Icon name="Vote" />
								<span>{t("COMMON.VOTE")}</span>
							</Button>
						</>
					)}
				</div>
			</Tooltip>
		</div>
	);
};
