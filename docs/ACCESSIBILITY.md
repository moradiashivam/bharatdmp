# Accessibility (WCAG 2.1 AA)

Phase 34 audit: axe-core WCAG 2.1 A/AA rules on 30 representative public and signed-in pages (Super Admin, Funder, Researcher). Result after fixes: 0 violations, no duplicate ids.

Done: skip-to-content link; real page language in `<html lang>`; labelled landmarks and `aria-current` on sidebar; visible keyboard focus ring; all form fields labelled; icon-only buttons/links named; text contrast >= 4.5:1; keyboard-scrollable wide tables; reduced-motion support; flash messages announced (`role=alert/status`).

Still recommended: a manual screen-reader pass (NVDA/VoiceOver) on the DMP form builder and answer editor, and re-running the audit after theme colour changes (organisation brand colours can lower contrast).
