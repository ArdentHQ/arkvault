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

		const controller = new AbortController();

		// @TODO: Fetch block info/height from sdk (not yet supported).
		const fetchBlockHeight = async () => {
			setIsLoading(true);

			try {
				const [api] = network.toObject().hosts;
				const response = await new Http.HttpClient(0)
					.withOptions({ signal: controller.signal })
					.get(`${api.host}/blocks/${blockHash}`);
				const { data } = response.json() as { data: { number: number } };

				if (!controller.signal.aborted) {
					setBlockHeight(Numeral.make("en").format(data.number));
				}
			} catch {
				// The block height is optional, so a failed or aborted request just leaves it empty.
			} finally {
				if (!controller.signal.aborted) {
					setIsLoading(false);
				}
			}
		};

		void fetchBlockHeight();

		return () => controller.abort();
	}, [blockHash, network]);

	return { blockHeight, isLoading };
};
