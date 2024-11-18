export const removeArkNetworks = ({ data }) => {
	if (!data.networks) {
		data.networks = {};
	}

	delete data.networks.ark
};
