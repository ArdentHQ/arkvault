export enum TransactionType {
	Transfer = 0,
	DelegateRegistration = 2,
	Vote = 3,
	MultiSignature = 4,

	MultiPayment = 6,
	DelegateResignation = 7,
	UsernameRegistration = 8,
	UsernameResignation = 9,
}

export enum TransactionTypeGroup {
	Test = 0,
	Core = 1,
}
