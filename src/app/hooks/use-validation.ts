import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useEnvironmentContext } from "@/app/contexts";
import { password } from "@/app/validations/password";
import { exchangeOrder } from "@/domains/exchange/validations";
import { signMessage, verifyMessage } from "@/domains/message/validations";
import { createProfile } from "@/domains/profile/validations";
import { settings, server, network } from "@/domains/setting/validations";
import {
	authentication,
	common,
	delegateRegistration,
	multiSignatureRegistration,
	sendTransfer,
	sendVote,
} from "@/domains/transaction/validations";
import { receiveFunds } from "@/domains/wallet/validations";

export const useValidation = () => {
	const { t } = useTranslation();
	const { env } = useEnvironmentContext();

	return useMemo(
		() => ({
			authentication: authentication(t),
			common: common(t),
			createProfile: createProfile(t, env),
			delegateRegistration: delegateRegistration(t),
			exchangeOrder: exchangeOrder(t),
			multiSignatureRegistration: multiSignatureRegistration(t),
			network: network(t),
			password: password(t),
			receiveFunds: receiveFunds(t),
			sendTransfer: sendTransfer(t),
			sendVote: sendVote(t),
			server: server(t),
			settings: settings(t, env),
			signMessage: signMessage(t),
			verifyMessage: verifyMessage(t),
		}),
		[t, env],
	);
};
