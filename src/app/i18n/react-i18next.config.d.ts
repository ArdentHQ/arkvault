import "react-i18next";
import "i18next";

import { defaultNS, resources } from "./index";

declare module "i18next" {
	interface CustomTypeOptions {
		returnNull: false;
	}
}

declare module "react-i18next" {
	interface CustomTypeOptions {
		defaultNS: typeof defaultNS;
		resources: (typeof resources)["en"];
	}
}
