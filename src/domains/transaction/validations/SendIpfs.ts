import { CID } from "multiformats";

const isCID = (hash: string): boolean => {
	try {
		return Boolean(CID.parse(hash));
	} catch {
		return false;
	}
};

export const sendIpfs = (t: any) => ({
	hash: () => ({
		required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
			field: t("TRANSACTION.IPFS_HASH"),
		}),
		validate: (value: string) =>
			isCID(value) ||
			t("COMMON.VALIDATION.FIELD_INVALID", {
				field: t("TRANSACTION.IPFS_HASH"),
			}),
	}),
	network: () => ({
		required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
			field: t("COMMON.NETWORK"),
		}),
	}),
	senderAddress: () => ({
		required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
			field: t("COMMON.SENDER_ADDRESS"),
		}),
	}),
});
