import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";
import { EmptyVotes, Votes } from "./WalletVote.blocks";
import { WalletVoteSkeleton } from "./WalletVoteSkeleton";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { isLedgerWalletCompatible } from "@/utils/wallet-utils";
import { Tooltip } from "@/app/components/Tooltip";
import { IReadWriteWallet } from "@ardenthq/sdk-profiles/distribution/esm/wallet.contract";

interface WalletVoteProperties {
	wallet: IReadWriteWallet | undefined;
	onButtonClick: (address?: string) => void;
	votes: Contracts.VoteRegistryItem[];
	isLoadingVotes: boolean;
	wallets?: Contracts.IReadWriteWallet[];
}

export const WalletVote = ({ wallet, onButtonClick, votes, isLoadingVotes, wallets = [] }: WalletVoteProperties) => {
	const { t } = useTranslation();

	if (isLoadingVotes || !wallet) {
		return <WalletVoteSkeleton />;
	}

	const activeDelegates = wallet.network().delegateCount();

	const renderVotes = () => {
		if (wallets.length > 1) {
			return (
				<div className="w-full">
					<p className="px-[22px] pb-4 text-center text-base font-semibold text-theme-secondary-700 dark:text-theme-dark-200 md:mt-0 md:px-0 md:pb-0 md:text-left">
						{t("WALLETS.PAGE_WALLET_DETAILS.MANAGE_VOTES_FOR_YOUR_ADDRESSES")}
					</p>
				</div>
			);
		}

		if (votes.length === 0) {
			return <EmptyVotes />;
		}

		return <Votes wallet={wallet} votes={votes} activeDelegates={activeDelegates} onButtonClick={onButtonClick} />;
	};

	return (
		<div
			data-testid="WalletVote"
			className="-mt-4 flex w-full flex-col items-center md:mt-0 md:flex-row md:items-center"
		>
			{renderVotes()}

			<Tooltip content={isLedgerWalletCompatible(wallet) ? "" : t("COMMON.LEDGER_COMPATIBILITY_ERROR")}>
				<div className="md:max-md:self-end w-full md:w-auto">
					{wallets.length > 1 && (
						<>
							<Button
								data-testid="WalletMyVotes__button"
								variant="secondary-icon"
								className="mt-4 hidden w-full space-x-2 whitespace-nowrap text-theme-primary-600 disabled:bg-transparent dark:text-theme-dark-navy-400 dark:disabled:bg-transparent md:mt-0 md:flex md:w-auto md:px-2 md:py-[3px]"
								onClick={() => onButtonClick()}
							>
								<Icon name="Vote" />
								<span>{t("COMMON.MY_VOTES")}</span>
							</Button>

							<Button
								data-testid="WalletMyVotes__button_mobile"
								variant="secondary"
								className="w-full text-theme-primary-600 disabled:bg-transparent dark:text-white dark:disabled:bg-transparent md:hidden"
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
								className="mt-4 hidden w-full space-x-2 text-theme-primary-600 disabled:bg-transparent dark:text-theme-dark-navy-400 dark:disabled:bg-transparent md:mt-0 md:flex md:w-auto md:px-2 md:py-[3px]"
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
								className="w-full text-theme-primary-600 disabled:bg-transparent dark:text-white dark:disabled:bg-transparent md:hidden"
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
