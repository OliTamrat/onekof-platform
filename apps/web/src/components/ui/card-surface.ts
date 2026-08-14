/**
 * The product-wide card surface — one definition, imported everywhere, so a
 * card's edge, face and hover read the same on every screen.
 *
 * The rule: one visible slate-200/50 edge in BOTH themes (no dark: override),
 * a top-left to bottom-right face gradient, and the brand teal on hover. This
 * was codified after the invalid dark-border classes were removed product-wide
 * — the light edge is the deliberate look, not a fallback.
 *
 * Padding is deliberately not included: cards carry different densities, and
 * the caller appends its own (`p-6` for the dashboard's cards).
 *
 * Do not put an offset ghost layer behind a card (`absolute -bottom-1 -right-1`
 * with a gradient): it thickens the bottom and right edges only, which is what
 * made neighbouring dashboard cards look like they had unequal margins.
 */
export const CARD_SURFACE =
  'rounded-xl bg-gradient-to-br from-white to-slate-50 dark:from-[#12161B] dark:to-[#0B0E11] ' +
  'shadow-md hover:shadow-xl transition-all duration-300 ' +
  'border border-slate-200/50 ' +
  'hover:border-[#1C8C7D] dark:hover:border-[#1C8C7D]';

/**
 * Card heading type scale. Every card on a screen states its name the same
 * way; a card whose title is a faint 11px micro-label next to a neighbour's
 * 18px heading reads as the weaker card even when it carries the main figure.
 */
export const CARD_TITLE = 'text-lg font-semibold text-slate-900 dark:text-white';

/** One line under the title saying what the card is for. */
export const CARD_SUBTITLE = 'text-sm text-slate-600 dark:text-white/70';

/**
 * The tinted square an icon sits in, beside a card title. Pass the accent
 * colour through `style` when it varies with the data; the default is brand
 * teal.
 */
export const CARD_ICON_CHIP =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors';
