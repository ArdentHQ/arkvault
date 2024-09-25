import { useEffect, useState } from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import { Networks } from "@ardenthq/sdk";

import { constructWalletsFromPublicKeys } from "@/domains/transaction/components/MultiSignatureDetail/MultiSignatureDetail.helpers";

export const useMusigParticipants = ({ profile, publicKeys, network }: { publicKeys: string[], network: Networks.Network, profile: Contracts.IProfile }) => {

	const [participants, setParticipants] = useState<Contracts.IReadWriteWallet[]>([])

	useEffect(() => {
		const constructWallets = async () => {
			const wallets = await constructWalletsFromPublicKeys({ network, profile, publicKeys })
			setParticipants(wallets)
		}

		constructWallets()
	}, [profile, publicKeys, network])

	return {
		participants
	}
}
