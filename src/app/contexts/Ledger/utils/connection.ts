import retry, { AbortError, Options } from "p-retry";
import { Coins } from "@ardenthq/sdk";
import { formatLedgerDerivationPath } from "./format-ledger-derivation-path";
import Eth from "@ledgerhq/hw-app-eth";
import { LedgerTransport } from "@/app/contexts/Ledger/Ledger.contracts";

export const setupEthTransportInstance = (transport: LedgerTransport) => new Eth(transport);

export const accessLedgerDevice = async (coin: Coins.Coin) => {
	try {
		await coin.__construct();
		await coin.ledger().connect((transport) => setupEthTransportInstance(transport));
	} catch (error) {
		// If the device is open, continue normally.
		// Can be triggered when the user retries ledger connection.
		if (error.message !== "The device is already open.") {
			throw error;
		}
	}
};

export const accessLedgerApp = async ({ coin }: { coin: Coins.Coin }) => {
	await accessLedgerDevice(coin);

	await coin.ledger().getPublicKey(
		formatLedgerDerivationPath({
			coinType: coin.config().get<number>("network.constants.slip44"),
		}),
	);
};

export const persistLedgerConnection = async ({
	coin,
	options,
	hasRequestedAbort,
}: {
	coin: Coins.Coin;
	options: Options;
	hasRequestedAbort: () => boolean;
}) => {
	const retryAccess: any = async (attempts: number) => {
		if (hasRequestedAbort() && attempts > 1) {
			throw new AbortError("CONNECTION_ERROR");
		}

		try {
			await accessLedgerApp({ coin });
		} catch (error) {
			// Abort on version error or continue retrying access.
			if (error.message === "VERSION_ERROR") {
				throw new AbortError("VERSION_ERROR");
			}

			throw error;
		}
	};

	await retry(retryAccess, options);
};
