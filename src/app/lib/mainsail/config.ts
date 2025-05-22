import { configManager } from "./config.manager";

export const applyCryptoConfiguration = ({ crypto, height }): void => {
	configManager.setConfig(crypto);
	configManager.setHeight(height);
};
