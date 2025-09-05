export const getFeeType = (numberOfRecipients: number): "multiPayment" | "transfer" =>
	numberOfRecipients > 1 ? "multiPayment" : "transfer";
