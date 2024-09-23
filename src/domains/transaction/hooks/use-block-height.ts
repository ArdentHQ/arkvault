import { useEffect, useState } from "react";
import { HttpClient } from "@/app/services/HttpClient";
import { Networks } from "@ardenthq/sdk";
import { Numeral } from "@ardenthq/sdk-intl";

export const useBlockHeight = ({
	blockId,
	network,
}: {
	blockId?: string;
	network: Networks.Network;
}): { blockHeight?: string; isLoading: boolean } => {
	const [blockHeight, setBlockHeight] = useState<string>();
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const client = new HttpClient(0);

		// @TODO: Fetch block info/height from sdk (not yet supported).
		const fetchBlockHeight = async () => {
			setIsLoading(true);

			try {
				const {
					hosts: [api],
				} = network.toObject();
				const response = await client.get(`${api.host}/blocks/${blockId}`);
				const { data } = response.json();

				setBlockHeight(Numeral.make("en").format(data.height));
			} catch {
				//
			}

			setIsLoading(false);
		};

		if (blockId) {
			fetchBlockHeight();
		}
	}, [blockId, network]);

	return {
		blockHeight,
		isLoading,
	};
};
