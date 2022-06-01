import { Contracts } from "@payvo/sdk-profiles";

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
				{(votes as Contracts.IReadOnlyWallet[]).map((vote: Contracts.IReadOnlyWallet, index: number) => (
					<VoteItem currency={currency} wallet={vote} index={index} key={index} />
				))}
			</ListWrapper>
		);
	}

	const renderVoteItem = (vote: Contracts.VoteRegistryItem, index: number) => {
		assertReadOnlyWallet(vote.wallet);

		return (
			<VoteItem
				index={index}
				wallet={vote.wallet}
				amount={vote.amount}
				currency={currency}
				isNegativeAmount={isNegativeAmount}
			/>
		);
	};

	return (
		<ListWrapper>
			{(votes as Contracts.VoteRegistryItem[]).map((vote: Contracts.VoteRegistryItem, index: number) =>
				renderVoteItem(vote, index),
			)}
		</ListWrapper>
	);
};
