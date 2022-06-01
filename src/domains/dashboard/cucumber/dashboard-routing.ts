import { cucumber, getLocation, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";

cucumber("@routeToDashboard", {
	"Given Alice signs into her profile": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await goToProfile(t);
	},
	"Then she is routed to the dashboard": async (t: TestController) => {
		await t.expect(getLocation()).contains("/dashboard");
	},
});
