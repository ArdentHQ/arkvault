import { Networks } from "@/app/lib/mainsail";
import { Contracts as ProfilesContracts } from "@/app/lib/profiles";
import React, { useEffect } from "react";

export const SelectAccountStep = ({
	network,
	profile,
}: {
	network: Networks.Network;
	profile: ProfilesContracts.IProfile;
}) => {
	return (
		<section data-testid="SelectAddressStep" className="space-y-4">
			<div>select account step</div>
		</section>
	);
};
