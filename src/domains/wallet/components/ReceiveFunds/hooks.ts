import { QRCode, URI } from "@ardenthq/sdk-helpers";
import { useCallback, useEffect, useState } from "react";

import { shouldUseDarkColors } from "@/utils/theme";

interface QRCodeProperties {
	nethash: string;
	coin: string;
	amount: string;
	memo: string;
	address: string;
	method?: string;
}

export const useQRCode = ({ amount, address, memo, coin, nethash, method }: QRCodeProperties) => {
	const [data, setData] = useState<{ uri?: string; image?: string }>({
		image: undefined,
		uri: undefined,
	});

	const maxLength = 255;

	const formatQR = useCallback(({ amount, address, memo, coin, nethash, method = "transfer" }: QRCodeProperties) => {
		const uri = new URI();

		const parameters = uri.serialize({
			coin,
			method,
			nethash,
			recipient: address,
			...(amount && { amount }),
			...(memo && { memo: memo?.slice(0, maxLength) }),
		});

		return `${window.location.origin.toString()}/#/?${parameters}`;
	}, []);

	useEffect(() => {
		const color = shouldUseDarkColors()
			? {
					dark: "#212225",
					light: "#eef3f5",
			  }
			: {
					dark: "#212225",
					light: "#fff",
			  };

		const generateQRCode = async () => {
			const uri = address ? formatQR({ address, amount, coin, memo, method, nethash }) : undefined;

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
	}, [amount, memo, nethash, address, formatQR, coin, method]);

	return data;
};
