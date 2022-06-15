import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";
import { EmptyVotes, Votes } from "./WalletVote.blocks";
import { WalletVoteSkeleton } from "./WalletVoteSkeleton";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";

interface WalletVoteProperties {
	wallet: Contracts.IReadWriteWallet;
	onButtonClick: (address?: string) => void;
	votes: Contracts.VoteRegistryItem[];
	isLoadingVotes: boolean;
}

export const WalletVote = ({ wallet, onButtonClick, votes, isLoadingVotes }: WalletVoteProperties) => {
	const { t } = useTranslation();

	if (isLoadingVotes) {
		return <WalletVoteSkeleton />;
	}

	const activeDelegates = wallet.network().delegateCount();

	const renderVotes = () => {
		if (votes.length === 0) {
			return <EmptyVotes wallet={wallet} />;
		}

		return <Votes wallet={wallet} votes={votes} activeDelegates={activeDelegates} onButtonClick={onButtonClick} />;
	};

	return (
		<div data-testid="WalletVote" className="flex w-full flex-col items-center md:flex-row md:items-start">
			{renderVotes()}

			<Button
				data-testid="WalletVote__button"
				disabled={
					wallet.balance() === 0 ||
					(wallet.network().usesLockedBalance() &&
						wallet.balance("available") < wallet.network().votesAmountStep()) ||
					!wallet.hasBeenFullyRestored() ||
					!wallet.hasSyncedWithNetwork()
				}
				variant="secondary"
				className="mt-4 w-full space-x-2 md:mt-0 md:w-auto"
				onClick={() => onButtonClick()}
			>
				<Icon name="Vote" />
				<span>{t("COMMON.VOTE")}</span>
			</Button>
		</div>
	);
};
