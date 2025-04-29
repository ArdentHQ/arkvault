import { bundle, Coins } from "@/app/lib/sdk";

import { AddressService } from "./address.service";
import { ClientService } from "./client.service";
import { ServiceProvider } from "./coin.provider";
import { ConfirmedTransactionData } from "./confirmed-transaction.dto";
import { FeeService } from "./fee.service";
import { KnownWalletService } from "./known-wallet.service";
import { LedgerService } from "./ledger.service";
import { manifest } from "./manifest";
import { MessageService } from "./message.service";
import { PrivateKeyService } from "./private-key.service";
import { PublicKeyService } from "./public-key.service";
import { SignedTransactionData } from "./signed-transaction.dto";
import { TransactionService } from "./transaction.service";
import { WalletData } from "./wallet.dto";
import { WIFService } from "./wif.service";

export { configManager } from "./crypto/managers/config.js";
export * from "./helpers/format-units";
export * from "./helpers/parse-units";

export const Mainsail: Coins.CoinBundle = bundle({
	dataTransferObjects: {
		ConfirmedTransactionData,
		SignedTransactionData,
		WalletData,
	},
	manifest,
	serviceProvider: ServiceProvider,
	services: {
		AddressService,
		ClientService,
		FeeService,
		KnownWalletService,
		LedgerService,
		MessageService,
		PrivateKeyService,
		PublicKeyService,
		TransactionService,
		WIFService,
	},
});
