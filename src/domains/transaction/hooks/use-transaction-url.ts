import { Contracts } from "@/app/lib/profiles";
import { generatePath } from "react-router";
import { ProfilePaths } from "@/router/paths";

const generateSendTransferPath = (profile: Contracts.IProfile, url: string) => {
	const path = generatePath(ProfilePaths.SendTransfer, { profileId: profile.id() });
	const urlSearchParameters = new URL(url.replace("#/", "")).searchParams;

	return `${path}&${urlSearchParameters.toString()}`;
};

const urlSearchParameters = (url: string) => new URL(url.replace("#", "/")).searchParams;

export const useTransactionURL = () => ({
	generateSendTransferPath,
	urlSearchParameters,
});
