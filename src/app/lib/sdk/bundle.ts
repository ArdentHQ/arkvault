import { CoinBundle } from "./coin.contracts";
import { AbstractServiceProvider, IServiceProvider } from "./ioc";

export const bundle = (data: CoinBundle): CoinBundle => {
	let serviceProvider: IServiceProvider;

	if (data.serviceProvider) {
		serviceProvider = data.serviceProvider;
	} else {
		serviceProvider = AbstractServiceProvider as unknown as IServiceProvider;
	}

	return {
		dataTransferObjects: data.dataTransferObjects,
		manifest: data.manifest,
		serviceProvider,
		services: data.services,
	};
};
