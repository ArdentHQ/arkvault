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
		if (blockHeight) {
			return;
		}

		let isCancelled = false;
		const client = new Http.HttpClient(0);

		// @TODO: Fetch block info/height from sdk (not yet supported).
		const fetchBlockHeight = async () => {
			setIsLoading(true);

			try {
				const {
					hosts: [api],
				} = network.toObject();
				const response = await client.get(`${api.host}/blocks/${blockHash}`);
				const { data } = response.json();

				if (!isCancelled) {
					setBlockHeight(Numeral.make("en").format(data.number));
				}
			} catch {
				//
			}

			if (!isCancelled) {
				setIsLoading(false);
			}
		};

		if (blockHash) {
			fetchBlockHeight();
		}

		return () => {
			isCancelled = true;
		};
	}, [blockHash, network, blockHeight]);

	return {
		blockHeight,
		isLoading,
	};
};
