import { ComponentType } from "react";
import { ProfilePaths } from "@/router/paths";
import { RouteItem } from "@/router/router.types";
import preloadLazy from "@/utils/preload-lazy";

const SendValidatorResignation = preloadLazy(() => import("./pages/SendValidatorResignation"));
const SendRegistration = preloadLazy(() => import("./pages/SendRegistration"));
const SendTransfer = preloadLazy(() => import("./pages/SendTransfer") as Promise<{ default: ComponentType<unknown> }>);
const SendVote = preloadLazy(() => import("./pages/SendVote"));
const SendUsernameResignation = preloadLazy(() => import("./pages/SendUsernameResignation"));

export const TransactionRoutes: RouteItem[] = [
	{
		component: SendRegistration,
		exact: true,
		path: ProfilePaths.SendRegistration,
	},
	{
		component: SendRegistration,
		exact: true,
		path: ProfilePaths.SendRegistrationProfile,
	},
	{
		component: SendValidatorResignation,
		exact: true,
		path: ProfilePaths.SendValidatorResignation,
	},
	{
		component: SendValidatorResignation,
		exact: true,
		path: ProfilePaths.SendValidatorResignationProfile,
	},
	{
		component: SendUsernameResignation,
		exact: true,
		path: ProfilePaths.SendUsernameResignation,
	},
	{
		component: SendUsernameResignation,
		exact: true,
		path: ProfilePaths.SendUsernameResignationProfile,
	},
	{
		component: SendVote,
		exact: true,
		path: ProfilePaths.SendVoteWallet,
	},
	{
		component: SendVote,
		exact: true,
		path: ProfilePaths.SendVote,
	},
];
