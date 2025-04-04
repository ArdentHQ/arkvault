/* istanbul ignore file */
/* eslint unicorn/no-abusive-eslint-disable: "off" */
/* eslint-disable */

import { BigNumber } from "@/app/lib/helpers";

import { BigNumberService } from "./big-number.service";
import { ConfigRepository } from "./config";
import { IContainer } from "./container.contracts";
import { SignedTransactionData } from "./dto";
import { NotImplemented } from "./exceptions";
import { FeeService, TransactionFeeOptions, TransactionFees } from "./fee.contract";
import { HttpClient } from "./http";
import { NetworkHostSelector } from "./network.models";
import { BindingType } from "./service-provider.contract";

export class AbstractFeeService implements FeeService {
	protected readonly configRepository: ConfigRepository;
	protected readonly bigNumberService: BigNumberService;
	protected readonly httpClient: HttpClient;
	protected readonly hostSelector: NetworkHostSelector;

	public constructor(container: IContainer) {
		this.configRepository = container.get(BindingType.ConfigRepository);
		this.bigNumberService = container.get(BindingType.BigNumberService);
		this.httpClient = container.get(BindingType.HttpClient);
		this.hostSelector = container.get(BindingType.NetworkHostSelector);
	}

	public async all(): Promise<TransactionFees> {
		throw new NotImplemented(this.constructor.name, this.all.name);
	}

	public async calculate(transaction: SignedTransactionData, options?: TransactionFeeOptions): Promise<BigNumber> {
		throw new NotImplemented(this.constructor.name, this.calculate.name);
	}
}
