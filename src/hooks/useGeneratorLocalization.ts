import { useEffect, useState } from 'react';
import { GeneratorMeta, LanguageCode } from '../types';

type Localization = {
  title: (id: string, language: LanguageCode, fallback: string) => string;
  shortTitle: (id: string, language: LanguageCode, fallback: string) => string;
  description: (meta: GeneratorMeta, language: LanguageCode) => string;
};

const fallbackLocalization: Localization = {
  title: (_id, _language, fallback) => fallback,
  shortTitle: (_id, _language, fallback) => fallback,
  description: (meta) => meta.description,
};

let localizationPromise: Promise<Localization> | undefined;

function loadGeneratorLocalization(): Promise<Localization> {
  if (!localizationPromise) {
    localizationPromise = Promise.all([
      import('../i18n/generatorTitles'),
      import('../i18n/generatorContent'),
    ]).then(([titles, content]) => ({
      title: titles.getLocalizedGeneratorTitle,
      shortTitle: titles.getLocalizedGeneratorShortTitle,
      description: content.getLocalizedGeneratorDescription,
    })).catch((error) => {
      localizationPromise = undefined;
      throw error;
    });
  }
  return localizationPromise;
}

export function useGeneratorLocalization(): Localization {
  const [localization, setLocalization] = useState<Localization>(fallbackLocalization);

  useEffect(() => {
    let active = true;
    void loadGeneratorLocalization()
      .then((loaded) => { if (active) setLocalization(loaded); })
      .catch((error: unknown) => {
        if (import.meta.env.DEV) console.error('Unable to load generator translations', error);
      });
    return () => { active = false; };
  }, []);

  return localization;
}
