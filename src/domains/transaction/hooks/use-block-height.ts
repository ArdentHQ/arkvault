import { useEffect, useState } from "react";
import { Http, Networks } from "@/app/lib/mainsail";
import { Numeral } from "@/app/lib/intl";

export const useBlockHeight = ({
	blockHash,
	network,
}: {
	blockHash?: string;
	network: Networks.Network;
}): { blockHeight?: string; isLoading: boolean } => {
	const [blockHeight, setBlockHeight] = useState<string>();
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (!blockHash) {
			return;
		}

		let isCancelled = false;

		// @TODO: Fetch block info/height from sdk (not yet supported).
		const fetchBlockHeight = async () => {
			setIsLoading(true);

			try {
				const [api] = network.toObject().hosts;
				const response = await new Http.HttpClient(0).get(`${api.host}/blocks/${blockHash}`);
				const { data } = response.json() as { data: { number: number } };

				if (!isCancelled) {
					setBlockHeight(Numeral.make("en").format(data.number));
				}
			} catch {
				// The block height is optional, so a failed request just leaves it empty.
			} finally {
				if (!isCancelled) {
					setIsLoading(false);
				}
			}
		};

		void fetchBlockHeight();

		return () => {
			isCancelled = true;
		};
	}, [blockHash, network]);

	return { blockHeight, isLoading };
};
