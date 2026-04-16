import { Contracts } from "@/app/lib/profiles";

export const confirmSendVote = (
	wallet: Contracts.IReadWriteWallet,
	type: "unvote" | "vote" | "combined",
	votes: Contracts.VoteRegistryItem[],
	unvotes: Contracts.VoteRegistryItem[],
): Promise<string> =>
	new Promise((resolve) => {
		const interval = setInterval(async () => {
			let isConfirmed = false;

			await wallet.synchroniser().votes();
			const walletVotes = wallet.voting().current();

			if (type === "vote") {
				isConfirmed = walletVotes.some(({ wallet }) => wallet?.address() === votes[0].wallet?.address());
			}

			if (type === "unvote") {
				isConfirmed = !walletVotes.some(({ wallet }) => wallet?.address() === unvotes[0].wallet?.address());
			}

			if (type === "combined") {
				const voteConfirmed = walletVotes.some(
					({ wallet }) => wallet?.address() === votes[0].wallet?.address(),
				);

				const unvoteConfirmed = !walletVotes.some(
					({ wallet }) => wallet?.address() === unvotes[0].wallet?.address(),
				);

				isConfirmed = voteConfirmed && unvoteConfirmed;
			}

			/* istanbul ignore else -- @preserve */
			if (isConfirmed) {
				clearInterval(interval);
				resolve("");
			}
		}, 1000);
	});
