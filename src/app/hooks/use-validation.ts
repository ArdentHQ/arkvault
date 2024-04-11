import {
	authentication,
	common,
	delegateRegistration,
	multiSignatureRegistration,
	sendIpfs,
	sendTransfer,
	sendVote,
	usernameRegistration,
	validatorRegistration,
} from "@/domains/transaction/validations";
import { network, server, settings } from "@/domains/setting/validations";
import { signMessage, verifyMessage } from "@/domains/message/validations";

import { createProfile } from "@/domains/profile/validations";
import { exchangeOrder } from "@/domains/exchange/validations";
import { password } from "@/app/validations/password";
import { receiveFunds } from "@/domains/wallet/validations";
import { useEnvironmentContext } from "@/app/contexts";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

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
			sendIpfs: sendIpfs(t),
			sendTransfer: sendTransfer(t),
			sendVote: sendVote(t),
			server: server(t),
			settings: settings(t, env),
			signMessage: signMessage(t),
			usernameRegistration: usernameRegistration(t),
			validatorRegistration: validatorRegistration(t),
			verifyMessage: verifyMessage(t),
		}),
		[t, env],
	);
};
