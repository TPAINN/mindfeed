/* ── cardLocale — one rule for card content across every screen ─────────────
   Cards can carry a language variant (titleEn/bodyEn/tldrEn/whyEn for the
   bilingual demo deck). Real backend cards only have the canonical (Greek)
   fields and no En variant, so they fall back to those in English mode too.
   categoryLabel resolves a card's category name through the cat.* i18n keys
   (keyed by the backend's Category slug); if a slug is unknown it falls back
   to the database name. This keeps the demo, the feed and the Bookmarks
   screen rendering the same labels in the same language.
                                                                              */
import { useLang } from '../context/LangContext'
import { useT } from './useT'

export function localizeCard(card, lang) {
  if (!card) return card
  if (lang === 'en') {
    return {
      ...card,
      title: card.titleEn || card.title,
      body: card.bodyEn || card.body,
      tldr: card.tldrEn || card.tldr,
      whyItMatters: card.whyEn || card.whyItMatters,
    }
  }
  // Greek is canonical — strip any En shadows so both modes are symmetric.
  return {
    ...card,
    title: card.title || card.titleEn,
    body: card.body || card.bodyEn,
    tldr: card.tldr || card.tldrEn,
    whyItMatters: card.whyItMatters || card.whyEn,
  }
}

export function categoryLabel(category, t) {
  if (!category) return ''
  // cat.* exists for every official slug; unknown slugs fall back to the db name.
  return category.slug ? t(`cat.${category.slug}`, {}, category.name ?? '') : (category.name ?? '')
}

/* Convenience hook for components that render cards. */
export function useLocalizedCard(card) {
  const { lang } = useLang()
  const t = useT()
  const localized = localizeCard(card, lang)
  const label = (category) => categoryLabel(category, t)
  return { card: localized, categoryName: label(localized.category), lang }
}