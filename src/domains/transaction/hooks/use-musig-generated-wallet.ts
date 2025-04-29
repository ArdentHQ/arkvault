import { Contracts } from "@/app/lib/profiles";

export const useMusigGeneratedWallet = ({
	wallet,
	publicKeys,
	min,
}: {
	publicKeys: string[];
	wallet: Contracts.IReadWriteWallet;
	min?: number;
}) => {
	console.log(wallet, publicKeys, min);
	return {
		generatedWallet: undefined,
	};
};
