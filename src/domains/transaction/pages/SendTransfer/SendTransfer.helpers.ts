import { BuildTransferDataProperties } from "@/domains/transaction/pages/SendTransfer/SendTransfer.contracts";

export const buildTransferData = async ({ coin, recipients, memo, isMultiSignature }: BuildTransferDataProperties) => {
	let data: Record<string, any> = {};

	if (recipients?.length === 1) {
		data = {
			amount: +(recipients[0].amount ?? 0),
			to: recipients[0].address,
		};
	}

	if (!!recipients?.length && recipients.length > 1) {
		data = {
			payments: recipients.map(({ address, amount }) => ({
				amount: +(amount ?? 0),
				to: address,
			})),
		};
	}

	if (memo) {
		data.memo = memo;
	}

	const rounds = isMultiSignature ? "211" : "5";
	const expiration = await coin.transaction().estimateExpiration(rounds);

	if (expiration) {
		data.expiration = Number.parseInt(expiration);
	}

	return data;
};
