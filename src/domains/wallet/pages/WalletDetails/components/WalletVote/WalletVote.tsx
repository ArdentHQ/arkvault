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
}

export const WalletVote = ({ wallet, onButtonClick, votes, isLoadingVotes }: WalletVoteProperties) => {
	const { t } = useTranslation();

	if (isLoadingVotes || !wallet) {
		return <WalletVoteSkeleton />;
	}

	const activeDelegates = wallet.network().delegateCount();

	const renderVotes = () => {
		if (votes.length === 0) {
			return <EmptyVotes />;
		}

		return <Votes wallet={wallet} votes={votes} activeDelegates={activeDelegates} onButtonClick={onButtonClick} />;
	};

	return (
		<div data-testid="WalletVote" className="flex w-full flex-col items-center md:flex-row md:items-center">
			{renderVotes()}

			<Tooltip content={isLedgerWalletCompatible(wallet) ? "" : t("COMMON.LEDGER_COMPATIBILITY_ERROR")}>
				<div className="md:max-md:self-end w-full md:w-auto">
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
						className="mt-4 hidden w-full space-x-2 text-theme-primary-600 dark:text-theme-dark-navy-400 md:mt-0 md:flex md:w-auto md:px-2 md:py-[3px] disabled:bg-transparent dark:disabled:bg-transparent"
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
						className="w-full text-theme-primary-600 dark:text-white md:hidden disabled:bg-transparent dark:disabled:bg-transparent"
						onClick={() => onButtonClick()}
					>
						<Icon name="Vote" />
						<span>{t("COMMON.VOTE")}</span>
					</Button>
				</div>
			</Tooltip>
		</div>
	);
};
