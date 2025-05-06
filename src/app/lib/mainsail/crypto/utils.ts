import { configManager } from "./managers/index";

export const maxVendorFieldLength = (height?: number): number => configManager.getMilestone(height).vendorFieldLength;

export const isSupportedTransactionVersion = (version: number): boolean => {
	const aip11: boolean = configManager.getMilestone().aip11;

	if (aip11 && version !== 2) {
		return false;
	}

	if (!aip11 && version !== 1) {
		return false;
	}

	return true;
};
