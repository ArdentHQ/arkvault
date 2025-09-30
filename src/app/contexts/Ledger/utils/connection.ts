// @TODO: Move this entire logic into sdk ledger service.
import retry, { AbortError, Options } from "p-retry";
import { formatLedgerDerivationPath } from "./format-ledger-derivation-path";
import Eth, { ledgerService } from "@ledgerhq/hw-app-eth";
import { LedgerTransport } from "@/app/contexts/Ledger/Ledger.contracts";
import { LedgerService } from "@/app/lib/mainsail/ledger.service";

export const setupEthTransportInstance = (transport: LedgerTransport) => ({
	ledgerService,
	transport: new Eth(transport),
});

const accessLedgerDevice = async (ledgerService: LedgerService) => {
	try {
		await ledgerService.connect();
	} catch (error) {
		// If the device is open, continue normally.
		// Can be triggered when the user retries ledger connection.
		if (error.message !== "The device is already open.") {
			throw error;
		}
	}
};

const accessLedgerApp = async ({ ledgerService }: { ledgerService: LedgerService }) => {
	await accessLedgerDevice(ledgerService);

	await ledgerService.getPublicKey(
		formatLedgerDerivationPath({
			coinType: ledgerService.slip44(),
		}),
	);

	// Allows only eth based ledger apps and rejects others, including the old ark ledger app.
	const isEthApp = await ledgerService.isEthBasedApp();
	if (!isEthApp) {
		throw new Error("INCOMPATIBLE_APP");
	}
};

export const persistLedgerConnection = async ({
	ledgerService,
	options,
	hasRequestedAbort,
}: {
	ledgerService: LedgerService;
	options: Options;
	hasRequestedAbort: () => boolean;
}) => {
	const retryAccess: any = async (attempts: number) => {
		if (hasRequestedAbort() && attempts > 1) {
			throw new AbortError("CONNECTION_ERROR");
		}

		try {
			await accessLedgerApp({ ledgerService });
		} catch (error) {
			// Delay retry if an operation is in progress.
			// Error: InvalidStateError: An operation that changes the device state is in progress.
			if (error?.message?.includes?.("in progress")) {
				await new Promise((resolve) => setTimeout(resolve, 1000));
			}

			// Abort on version error or continue retrying access.
			if (error.message === "VERSION_ERROR") {
				throw new AbortError("VERSION_ERROR");
			}

			// Abort on version error or continue retrying access.
			if (error.message === "INCOMPATIBLE_APP") {
				throw new AbortError("INCOMPATIBLE_APP");
			}

			throw error;
		}
	};

	await retry(retryAccess, options);
};
