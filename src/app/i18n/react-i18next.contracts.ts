import { TFunction as TFunctionI18n } from "i18next";
import { buildTranslations } from "./helpers";

export type TranslationSet = ReturnType<typeof buildTranslations>;
export type TFunction = TFunctionI18n<"translation", undefined>;
