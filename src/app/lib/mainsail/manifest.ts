import MainsailDevnet from "./networks/mainsail.devnet";
import MainsailMainnet from "./networks/mainsail.mainnet";

export const manifest = {
	name: "Mainsail",
	networks: {
		"mainsail.devnet": MainsailDevnet,
		"mainsail.mainnet": MainsailMainnet,
	},
};
