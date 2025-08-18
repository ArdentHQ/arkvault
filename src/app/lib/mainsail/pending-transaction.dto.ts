import type { PendingPersistedJSON, UnconfirmedTransaction } from "./pending-transaction.contract";
import type { MultiPaymentItem } from "@/app/lib/mainsail/confirmed-transaction.dto.contract";
import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";
import { UnitConverter } from "@arkecosystem/typescript-crypto";
import { TransactionBaseData, type TransactionBaseDTO, type KeyValuePair } from "./transaction-base.dto";

type PendingTransactionDTO = (UnconfirmedTransaction & { gasLimit?: number }) & TransactionBaseDTO;

export class PendingTransactionData extends TransactionBaseData<PendingTransactionDTO> {
	protected createdAt: DateTime = DateTime.make(Date.now());

	public configure(data: PendingTransactionDTO) {
		return super.configure(data);
	}

	public recipients(): { address: string; amount: number }[] {
		if (!this.isMultiPayment()) {
			return [];
		}
		return this.payments().map((p: MultiPaymentItem) => ({
			address: p.recipientId,
			amount: p.amount.toNumber(),
		}));
	}

	protected computeFee(): BigNumber {
		const gas = (this.data.gasLimit ?? (this.data as UnconfirmedTransaction).gas) as number;
		const gasPriceArk = BigNumber.make(UnitConverter.formatUnits(String(this.data.gasPrice), "ark"));

		return gasPriceArk.times(gas);
	}

	public isSuccess(): boolean {
		return false;
	}
	public isConfirmed(): boolean {
		return false;
	}
	public confirmations(): BigNumber {
		return BigNumber.make(0);
	}

	public timestamp(): DateTime {
		return this.createdAt;
	}
	protected serializeTimestamp(): string {
		return this.createdAt.toISOString();
	}

	public toPersistedJSON(): PendingPersistedJSON {
		return {
			createdAt: this.serializeTimestamp(),
			data: this.data.data,
			decimals: this.decimals,
			from: this.data.from,
			gas: this.data.gas.toString(),
			gasLimit: this.data.gasLimit,
			gasPrice: this.data.gasPrice.toString(),
			hash: this.data.hash,
			meta: {
				address: this.getMeta("address"),
				explorerLink: this.getMeta("explorerLink"),
				networkId: this.getMeta("networkId"),
			},
			network: this.data.network,
			nonce: this.data.nonce.toString(),
			r: this.data.r,
			s: this.data.s,
			senderPublicKey: this.data.senderPublicKey,
			to: this.data.to,
			v: this.data.v,
			value: this.data.value.toString(),
		};
	}

	public static fromPersistedJSON(json: PendingPersistedJSON): PendingTransactionData {
		const dto = new PendingTransactionData().configure({
			data: json.data as any,
			from: json.from,
			gas: json.gas,
			gasLimit: json.gasLimit,
			gasPrice: json.gasPrice,
			hash: json.hash,
			network: json.network,
			nonce: json.nonce,
			r: json.r,
			s: json.s,
			senderPublicKey: json.senderPublicKey,
			to: json.to,
			v: json.v,
			value: String(json.value),
		});

		if (json.decimals != null) {
			dto.withDecimals(json.decimals);
		}

		if (json.meta) {
			if (json.meta.address) {
				dto.setMeta("address", json.meta.address);
			}
			if (json.meta.networkId) {
				dto.setMeta("networkId", json.meta.networkId);
			}
			if (json.meta.explorerLink) {
				dto.setMeta("explorerLink", json.meta.explorerLink);
			}
		}

		try {
			const ms = new Date(json.createdAt).getTime();
			(dto as any).createdAt = DateTime.make(ms);
		} catch {
			(dto as any).createdAt = DateTime.make(Date.now());
		}

		return dto;
	}

	public toObject(): KeyValuePair {
		return super.toObject();
	}
	public toJSON(): KeyValuePair {
		return super.toJSON();
	}
	public toHuman(): KeyValuePair {
		return super.toHuman();
	}
}
