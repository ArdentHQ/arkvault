import { bundle, Coins } from "@ardenthq/sdk";

import { AddressService } from "./address.service";
import { ClientService } from "./client.service";
import { ServiceProvider } from "./coin.provider";
import { ConfirmedTransactionData } from "./confirmed-transaction.dto";
import { FeeService } from "./fee.service";
import { KeyPairService } from "./key-pair.service";
import { KnownWalletService } from "./known-wallet.service";
import { LedgerService } from "./ledger.service";
import { manifest } from "./manifest";
import { MessageService } from "./message.service";
import { MultiSignatureService } from "./multi-signature.service";
import { PrivateKeyService } from "./private-key.service";
import { ProberService } from "./prober.service";
import { PublicKeyService } from "./public-key.service";
import { SignedTransactionData } from "./signed-transaction.dto";
import { TransactionService } from "./transaction.service";
import { WalletData } from "./wallet.dto";
import { WIFService } from "./wif.service";

export * from "./crypto/managers/network";
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
		KeyPairService,
		KnownWalletService,
		LedgerService,
		MessageService,
		MultiSignatureService,
		PrivateKeyService,
		ProberService,
		PublicKeyService,
		TransactionService,
		WIFService,
	},
});
