import { buildTranslations } from "./helpers";

export type TranslationSet = ReturnType<typeof buildTranslations>;
export type TFunction = (key: string, options?: object) => string;
