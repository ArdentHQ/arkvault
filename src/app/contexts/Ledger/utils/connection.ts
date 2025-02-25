import retry, { AbortError, Options } from "p-retry";
import { Coins } from "@ardenthq/sdk";
import { formatLedgerDerivationPath } from "./format-ledger-derivation-path";
import { hasRequiredAppVersion } from "./validation";

export const accessLedgerDevice = async (coin: Coins.Coin) => {
	try {
		await coin.__construct();
		await coin.ledger().connect();
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

	if (!(await hasRequiredAppVersion(coin))) {
		throw new Error("VERSION_ERROR");
	}

	// Ensure that the app is accessible.
	const path = formatLedgerDerivationPath({
		coinType: coin.config().get<number>("network.constants.slip44"),
	})

	const mainsailEvmPath = "44'/111'/0'/0/0"
	const ethPath = "44'/60'/0'/0/0"


	try {
		console.log("Generating path ___________", ethPath)
		await coin.ledger().getPublicKey(ethPath)
		console.log("")
		console.log("")
	} catch (error) {
		console.log("Generating path [error]", error)
	}
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

	setTimeout(() => {
		retryAccess()
	}, 3000)

	// await retry(retryAccess, options);
};
