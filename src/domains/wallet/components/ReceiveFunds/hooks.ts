import { QRCode, URI } from "@ardenthq/sdk-helpers";
import { useCallback, useEffect, useState } from "react";

import { shouldUseDarkColors } from "@/utils/theme";

interface QRCodeProperties {
	network: string;
	coin: string;
	amount: string;
	memo: string;
	address: string;
	method?: string;
}

export const useQRCode = ({ network, amount, address, memo, coin, method }: QRCodeProperties) => {
	const [data, setData] = useState<{ uri?: string; image?: string }>({
		image: undefined,
		uri: undefined,
	});

	const maxLength = 255;

	const formatQR = useCallback(({ amount, address, memo, coin, network, method = "transfer" }: QRCodeProperties) => {
		const uri = new URI();

		const parameters = uri.serialize({
			coin,
			method,
			network,
			recipient: address,
			...(amount && { amount }),
			...(memo && { memo: memo?.slice(0, maxLength) }),
		});

		return `${window.location.origin.toString()}/#/?${parameters}`;
	}, []);

	useEffect(() => {
		const color = shouldUseDarkColors()
			? {
					dark: "#eef3f5",
					light: "#212225",
			  }
			: {
					dark: "#212225",
					light: "#fff",
			  };

		const generateQRCode = async () => {
			const uri = address ? formatQR({ address, amount, coin, memo, method, network }) : undefined;

			let image: string | undefined;

			try {
				image = await QRCode.fromString(uri!).toDataURL({ color, margin: 0, width: 250 });
			} catch {
				image = undefined;
			}

			setData({
				image,
				uri,
			});
		};

		generateQRCode();
	}, [amount, memo, network, address, formatQR, coin, method]);

	return data;
};
