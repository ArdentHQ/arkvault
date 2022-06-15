import LocaleCurrency from "locale-currency";
import React, { useMemo } from "react";

export const useLocaleCurrency = () => {
  const localeCurrency = useMemo(() => {
    let locale = Intl.DateTimeFormat().resolvedOptions().locale;

    if (!locale.includes("-")) {
      locale = navigator.language;
    }

    let currency = LocaleCurrency.getCurrency(locale) as string | null;

    if (!currency) {
      currency = "USD";
    }

    return currency;
  }, []);

  return localeCurrency;
};
