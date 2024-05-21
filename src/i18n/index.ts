import i18next from "i18next";
import I18NexFsBackend from "i18next-fs-backend";

import backendOptions from "./backend.json";

export async function initI18n(locale?: string): Promise<void> {
  const backend = new I18NexFsBackend(null, backendOptions);

  await i18next.use(backend).init({
    supportedLngs: ["en", "ja"],
    fallbackLng: "en",
    lng: locale,
    ns: ["commands"],
    defaultNS: "commands",
  });
}
