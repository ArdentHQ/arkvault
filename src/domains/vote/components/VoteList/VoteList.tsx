import { Contracts } from "@ardenthq/sdk-profiles";

import React from "react";
import tw, { styled } from "twin.macro";

import { VoteListProperties } from "./VoteList.contracts";
import { VoteItem } from ".";
import { assertReadOnlyWallet } from "@/utils/assertions";

const ListWrapper = styled.div`
	${tw`flex-1 -my-2`}
`;

export const VoteList = ({ votes, currency, isNegativeAmount = false }: VoteListProperties) => {
	if (votes.length === 0) {
		return <></>;
	}

	if ((votes[0] as Contracts.VoteRegistryItem).amount === undefined) {
		return (
			<ListWrapper>
				{(votes as Contracts.IReadOnlyWallet[]).map((vote: Contracts.IReadOnlyWallet) => (
					<VoteItem currency={currency} wallet={vote} key={vote.address()} />
				))}
			</ListWrapper>
		);
	}

	const renderVoteItem = (vote: Contracts.VoteRegistryItem) => {
		assertReadOnlyWallet(vote.wallet);

		return (
			<VoteItem
				key={vote.wallet.address()}
				wallet={vote.wallet}
				amount={vote.amount}
				currency={currency}
				isNegativeAmount={isNegativeAmount}
			/>
		);
	};

	return (
		<ListWrapper>
			{(votes as Contracts.VoteRegistryItem[]).map((vote: Contracts.VoteRegistryItem) => renderVoteItem(vote))}
		</ListWrapper>
	);
};
