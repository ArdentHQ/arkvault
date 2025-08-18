import type { UnconfirmedTransaction } from "./pending-transaction.contract";
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
        if (!this.isMultiPayment()) return [];
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
