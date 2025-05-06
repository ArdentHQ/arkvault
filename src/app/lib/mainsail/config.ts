import { Managers } from "./crypto/index.js";

export const applyCryptoConfiguration = ({ crypto, height }): void => {
	Managers.configManager.setConfig(crypto);
	Managers.configManager.setHeight(height);
};
