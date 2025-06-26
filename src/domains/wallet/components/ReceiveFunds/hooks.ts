import { useCallback, useEffect, useState } from "react";

import { QRCode } from "@/app/lib/helpers";
import { URLBuilder } from "@ardenthq/arkvault-url";
import { shouldUseDarkColors } from "@/utils/theme";

interface QRCodeProperties {
	nethash: string;
	amount: string;
	address: string;
	method?: string;
}

export const useQRCode = ({ amount, address, nethash }: QRCodeProperties) => {
	const [data, setData] = useState<{ uri?: string; image?: string }>({
		image: undefined,
		uri: undefined,
	});

	const formatQR = useCallback(({ amount, address, nethash }: QRCodeProperties) => {
		const urlBuilder = new URLBuilder(`${window.location.origin}/#/`);

		urlBuilder.setNethash(nethash);

		return urlBuilder.generateTransfer(address, {
			amount: +amount,
		});
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
			const uri = address ? formatQR({ address, amount, nethash }) : undefined;

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
	}, [amount, nethash, address, formatQR]);

	return data;
};
