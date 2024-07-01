import { TFunction as TFunction18n } from "i18next";
import { buildTranslations } from "./helpers";

export type TranslationSet = ReturnType<typeof buildTranslations>;
export type TFunction = TFunction18n<"translation", undefined>;
