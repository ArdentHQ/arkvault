/// <reference types="vite-plugin-svgr/client" />

import Multipayment from "./multipayment.svg?react";
import Received from "./received.svg?react";
import Return from "./return.svg?react";
import Sent from "./sent.svg?react";
import Unvote from "./unvote.svg?react";
import Vote from "./vote.svg?react";
import SendTransactionLight from "./send-transaction-light.svg?react";
import SendTransactionDark from "./send-transaction-dark.svg?react";
import SendTransactionLightGreen from "./send-transaction-light-green.svg?react";
import SendTransactionDarkGreen from "./send-transaction-dark-green.svg?react";
import ConfirmTransaction from "./confirm-transaction.svg?react";
import PendingTransaction from "./compass.svg?react";
import Mnemonic from "./mnemonic.svg?react";

export const TransactionIcons: any = {
	ConfirmTransaction,
	Mnemonic,
	Multipayment,
	PendingTransaction,
	Received,
	Return,
	SendTransactionDark,
	SendTransactionDarkGreen,
	SendTransactionLight,
	SendTransactionLightGreen,
	Sent,
	Unvote,
	Vote,
};
