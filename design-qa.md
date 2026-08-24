# Marcamar visual redesign — design QA

source visual truth:
- Shared landing language: /Users/murilo/.codex/generated_images/01a034d8-6078-7340-b99c-e14c965d25be/exec-f4d8f6f2-c497-4fd1-a980-e284c83075da.png
- Shared rotas e pontos language: /Users/murilo/.codex/generated_images/01a034d8-6078-7340-b99c-e14c965d25be/exec-9355dd20-68b8-4ed5-9643-88db1da60cf2.png

implementation screenshots:
- Landing baseline: /private/tmp/marcamar-home-deployed.png
- Rotas e pontos baseline: /private/tmp/marcamar-routes-deployed.png
- Como funciona: /private/tmp/marcamar-how-live.png
- Ajuda: /private/tmp/marcamar-help-live.png

viewport and normalization:
- Browser CSS viewport used for the new-page pass: default desktop viewport; screenshots captured from the deployed browser surface.
- Shared reference images: 1487 × 1058 pixels.
- Existing baseline implementation captures: 1482 × 1054 pixels at density 1.
- New-page screenshots were captured at the same browser surface and light theme; the browser chrome is excluded from comparison.
- State: public, unauthenticated, light theme, empty published-ride inventory where relevant.

## Findings

No actionable P0, P1, or P2 findings.

The remaining public surfaces now use the same Marcamar system as the selected landing and route-directory directions: sand background, ink typography, teal actions, coral CTAs, thin route lines, editorial hero copy, and generous section rhythm. Existing transaction and operator pages inherit the same tokens, surface borders, focus rings, and padding so the product no longer feels like separate templates.

Required fidelity surfaces:
- Fonts and typography: the large editorial heading, italic emphasis, compact uppercase kicker, and small metadata weights are consistent with the selected visual system. Existing app font stack remains intact for cross-page consistency.
- Spacing and layout rhythm: utility-page heroes, FAQ rows, legal sections, account shells, rides/detail content, dashboards, messages, and route requests use shared max-widths and responsive gutters. Mobile breakpoints collapse grids without hiding primary actions.
- Colors and visual tokens: remaining pages consume the established sand/ink/teal/coral tokens; old dark/card-heavy surfaces now use the same light surface rhythm and border treatment.
- Image quality and asset fidelity: public information pages stay intentionally image-light and reuse the established small-lancha direction where imagery is needed. No placeholder boats, gradients, native dropdowns, or handcrafted image approximations were added.
- Copy and content: new pages are Portuguese and product-specific. Terms and privacy explicitly identify themselves as pilot product drafts that require legal review before public operation.

Focused-region evidence:
- Como funciona: hero, passenger step sequence, operator path, and route-request CTA are visible in one coherent flow.
- Ajuda: hero, search input, accordion list, and request-route CTA are visible; the second FAQ was opened in-browser and its answer rendered.
- Existing surfaces: /lanchas, /perfil, and /admin were visited after deployment and did not show the 404 route.

Interaction and runtime checks:
- All new routes resolve: /como-funciona, /seguranca, /ajuda, /termos, and /privacidade.
- Help accordion opens and renders the selected answer.
- The redesigned route navigation points to real pages instead of hash-only or # placeholders.
- Browser console checked after the new-page pass: no errors or warnings.
- GitHub Actions verify passed for the implementation PR.

## Comparison history

- Pass 1: selected landing and routes references compared against their deployed baselines; no P0/P1/P2 findings.
- Pass 2: remaining public pages compared against the shared reference system and deployed screenshots. The only intentional deviation is the image-light treatment of help/legal content, which keeps those pages focused and avoids decorative filler; no fix required.

## Implementation Checklist

- [x] Redesign shared account, rides, detail, operator, route-request, messaging, admin, and recurring surfaces.
- [x] Add /como-funciona, /seguranca, /ajuda, /termos, and /privacidade.
- [x] Replace navbar hash routes and footer placeholder links.
- [x] Verify primary help interaction and public route rendering.
- [x] Verify clean browser console.
- [x] Verify GitHub Actions and Railway deployment.

## Follow-up Polish

- [P3] Add richer operator-specific boarding imagery once verified route media is available.
- [P3] Expand legal drafts with reviewed Brazilian terms and privacy language before public launch.

final result: passed
