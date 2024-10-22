import { DTO } from "@ardenthq/sdk";
import { DTO as ProfilesDTO } from "@ardenthq/sdk-profiles";

/**
 * @TODO: This can be handled in SDK to retrieve voting and unvoting public keys
 * through a common method/format, whether it's a signed or confirmed transaction.
 * Currently votes() unvotes() methods don't exist signed transaction data
 *  and `data` is a function in signed transaction and an object in confirmed transaction
 */
export const extractVotingData = ({ transaction }: { transaction: DTO.RawTransactionData }) => {
	if (transaction.isConfirmed()) {
		return {
			unvotes: transaction.unvotes(),
			votes: transaction.votes(),
		};
	}

	return signedTransactionVotingData({ transaction });
};

const signedTransactionVotingData = ({ transaction }: { transaction: ProfilesDTO.ExtendedSignedTransactionData }) => {
	const data = transaction.data().data();
	const votes = data?.asset?.votes ?? [];
	const unvotes = data?.asset?.unvotes ?? [];

	return {
		unvotes: unvotes.map((publicKey: string) => publicKey.replace(/^[+-]+/, "")),
		votes: votes.map((publicKey: string) => publicKey.replace(/^[+-]+/, "")),
	};
};
