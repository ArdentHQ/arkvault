import { BuildTransferDataProperties } from "@/domains/transaction/components/SendTransferSidePanel/SendTransfer.contracts";

export const buildTransferData = ({ recipients, memo }: BuildTransferDataProperties) => {
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

	return data;
};
