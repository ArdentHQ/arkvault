import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Helpers
import { buildTranslations } from "./helpers";

const defaultNS = "translation";

const resources = {
	en: {
		translation: buildTranslations(),
	},
};

i18n.use(initReactI18next).init({
	defaultNS,
	lng: "en",
	ns: [defaultNS],
	resources,
});

export { defaultNS, resources };

export { default as i18n } from "i18next";
