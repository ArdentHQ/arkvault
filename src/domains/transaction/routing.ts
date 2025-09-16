import { ProfilePaths } from "@/router/paths";
import { RouteItem } from "@/router/router.types";
import preloadLazy from "@/utils/preload-lazy";

const SendValidatorResignation = preloadLazy(() => import("./pages/SendValidatorResignation"));
const SendRegistration = preloadLazy(() => import("./pages/SendRegistration"));
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
];
