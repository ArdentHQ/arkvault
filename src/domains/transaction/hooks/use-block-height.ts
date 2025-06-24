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

				setBlockHeight(Numeral.make("en").format(data.number));
			} catch {
				//
			}

			setIsLoading(false);
		};

		if (blockHash) {
			fetchBlockHeight();
		}
	}, [blockHash, network, blockHeight]);

	return {
		blockHeight,
		isLoading,
	};
};
