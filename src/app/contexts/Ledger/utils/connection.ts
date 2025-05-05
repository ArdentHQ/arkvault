// @TODO: Move this entire logic into sdk ledger service.
import retry, { AbortError, Options } from "p-retry";
import { formatLedgerDerivationPath } from "./format-ledger-derivation-path";
import Eth, { ledgerService } from "@ledgerhq/hw-app-eth";
import { LedgerTransport } from "@/app/contexts/Ledger/Ledger.contracts";
import { LedgerService } from "@/app/lib/mainsail/ledger.service";
import { Contracts } from "@/app/lib/profiles";

export const setupEthTransportInstance = (transport: LedgerTransport) => ({
	ledgerService,
	transport: new Eth(transport),
});

const accessLedgerDevice = async (ledgerService: LedgerService) => {
	try {
		await ledgerService.connect((transport) => setupEthTransportInstance(transport));
	} catch (error) {
		// If the device is open, continue normally.
		// Can be triggered when the user retries ledger connection.
		if (error.message !== "The device is already open.") {
			throw error;
		}
	}
};

const accessLedgerApp = async ({ profile }: { profile: Contracts.IProfile }) => {
	const ledgerService = new LedgerService({ config: profile.activeNetwork().config() });
	await accessLedgerDevice(ledgerService);

	await ledgerService.getPublicKey(
		formatLedgerDerivationPath({
			coinType: ledgerService.slip44(),
		}),
	);
};

export const persistLedgerConnection = async ({
	profile,
	options,
	hasRequestedAbort,
}: {
	profile: Contracts.IProfile,
	options: Options;
	hasRequestedAbort: () => boolean;
}) => {
	const retryAccess: any = async (attempts: number) => {
		if (hasRequestedAbort() && attempts > 1) {
			throw new AbortError("CONNECTION_ERROR");
		}

		try {
			await accessLedgerApp({ profile });
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

			throw error;
		}
	};

	await retry(retryAccess, options);
};
