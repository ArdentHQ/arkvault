// Pre-Mainsail profiles encrypted data as CryptoJS AES output, which is never JSON.
export const isLegacyEncryption = (encrypted: string): boolean => {
	try {
		JSON.parse(encrypted);
		return false;
	} catch {
		return true;
	}
};
