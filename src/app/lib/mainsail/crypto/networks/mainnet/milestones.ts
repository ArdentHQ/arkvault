export const milestones = [
	{
		activeValidators: 53,
		block: {
			acceptExpiredTransactionTimestamps: true,
			maxPayload: 2_097_152,
			maxTransactions: 50,
			version: 0,
		},
		blocktime: 8,
		epoch: "2017-03-21T13:00:00.000Z",
		fees: {
			staticFees: {
				delegateRegistration: 2_500_000_000,
				delegateResignation: 2_500_000_000,
				htlcClaim: 0,
				htlcLock: 10_000_000,
				htlcRefund: 0,
				ipfs: 500_000_000,
				multiPayment: 10_000_000,
				multiSignature: 500_000_000,
				secondSignature: 500_000_000,
				transfer: 10_000_000,
				usernameRegistration: 2_500_000_000,
				usernameResignation: 2_500_000_000,
				vote: 100_000_000,
			},
		},
		height: 1,
		multiPaymentLimit: 64,
		reward: 0,
		vendorFieldLength: 64,
	},
	{
		height: 75_600,
		reward: 200_000_000,
	},
	{
		block: {
			maxPayload: 6_300_000,
			maxTransactions: 150,
		},
		height: 6_600_000,
	},
	{
		height: 8_128_000,
		vendorFieldLength: 255,
	},
	{
		block: {
			idFullSha256: true,
		},
		height: 8_204_000,
	},
	{
		block: {
			acceptExpiredTransactionTimestamps: false,
		},
		height: 9_000_000,
	},
	{
		aip11: true,
		height: 11_273_000,
	},
	{
		aip36: true,
		height: 13_705_000,
	},
	{
		aip37: true,
		height: 17_632_000,
	},
];
