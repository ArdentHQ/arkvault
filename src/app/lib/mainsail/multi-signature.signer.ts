import { IoC, Services } from "@ardenthq/sdk";
import { Exceptions } from "@mainsail/contracts";
import { Application } from "@mainsail/kernel";

import { BindingType } from "./coin.contract";
import { Managers } from "./crypto/index";
import { MultiSignatureTransaction } from "./multi-signature.contract";

export class MultiSignatureSigner {
	readonly #ledgerService!: Services.LedgerService;
	readonly #keyPairService!: Services.KeyPairService;
	readonly #app!: Application;

	public constructor(container: IoC.IContainer) {
		this.#ledgerService = container.get(IoC.BindingType.LedgerService);
		this.#keyPairService = container.get(IoC.BindingType.KeyPairService);
		this.#app = container.get(BindingType.Application);

		Managers.configManager.setConfig(container.get(BindingType.Crypto));
		Managers.configManager.setHeight(container.get(BindingType.Height));
	}

	public sign(): MultiSignatureTransaction {
		throw new Exceptions.NotImplemented(this.constructor.name, this.sign.name);
	}

	public async addSignature(): Promise<MultiSignatureTransaction> {
		throw new Exceptions.NotImplemented(this.constructor.name, this.addSignature.name);
	}
}
