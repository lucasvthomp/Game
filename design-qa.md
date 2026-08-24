# Marcamar visual redesign — design QA

source visual truth:
- Landing option 1: \`/Users/murilo/.codex/generated_images/01a034d8-6078-7340-b99c-e14c965d25be/exec-f4d8f6f2-c497-4fd1-a980-e284c83075da.png\`
- Rotas e pontos option 3: \`/Users/murilo/.codex/generated_images/01a034d8-6078-7340-b99c-e14c965d25be/exec-9355dd20-68b8-4ed5-9643-88db1da60cf2.png\`

implementation screenshots:
- Landing: \`/private/tmp/marcamar-home-deployed.png\`
- Rotas e pontos: \`/private/tmp/marcamar-routes-deployed.png\`

viewport and normalization:
- CSS viewport: 1487 × 1058, device scale factor 1.
- Source visual dimensions: 1487 × 1058.
- Browser-rendered implementation dimensions: 1482 × 1054 (content screenshot after browser chrome normalization).
- State: public, light theme, unauthenticated, empty published-ride inventory with pilot-route fallback.
- The same viewport and first-load state were used for both page captures. Source and implementation were opened and inspected before comparison.

## Findings

No actionable P0, P1, or P2 findings.

The selected visual hierarchy is present in both surfaces: a calm light navigation bar, a large route-first hero, a prominent search surface, a clear next-departures/directory section, and a trust/request CTA. The implementation intentionally uses a generated small passenger-lancha image rather than the larger vessel shown in the concept reference, because the product brief explicitly calls for small lanchas.

Required fidelity surfaces:
- Fonts and typography: display scale, italic emphasis, compact uppercase kickers, and readable route metadata preserve the selected editorial/transport tone. The product's existing font stack is retained for consistency across the rest of the MVP.
- Spacing and layout rhythm: hero, search module, route rows, point grid, and CTA use responsive max-widths and collapse to single-column controls below 760px. Desktop screenshots show no clipping or persistent-control overflow.
- Colors and visual tokens: sand, ink, teal, and coral tokens are applied consistently across navigation, controls, route rows, links, and trust surfaces. No gradients or native select controls were introduced.
- Image quality and asset fidelity: the generated small-lancha asset is sharp at the hero crop, is used on both selected surfaces, and is committed at \`client/public/images/marcamar-small-lancha.jpg\`.
- Copy and content: Portuguese copy is specific to small-lancha travel, uses honest "Consulte saídas" states when there is no published inventory, and links to the existing route-request flow rather than inventing availability.

Focused-region evidence:
- Landing hero/search: the screenshot shows the search fields, custom autocomplete inputs, date/passenger controls, CTA, proof line, and lancha crop in one above-the-fold state.
- Rotas directory: the screenshot shows the warm hero, route search, route filter, route rows, fallback availability labels, and active navigation label.

Interaction and runtime checks:
- Landing autocomplete opened with a partial "Ilh" query and exposed "Ilhabela".
- Landing search navigated to \`/lanchas?from=Ilhabela&to=Bonete&passengers=2\`.
- \`/rotas\` rendered the selected route-directory heading and list.
- Browser console checked at the final state: no errors or warnings.

## Comparison history

- Pass 1: compared both deployed screenshots against their selected option images. No P0/P1/P2 mismatch was found, so no visual iteration was required.

## Implementation Checklist

- [x] Selected option 1 implemented as the landing page.
- [x] Selected option 3 implemented as \`/rotas\`.
- [x] Small passenger-lancha imagery replaces the large-boat visual direction.
- [x] Functional route search and custom location autocomplete verified.
- [x] Responsive spacing and navigation/footer links added.
- [x] GitHub Actions \`verify\` check passed for the implementation PR.
- [x] Railway deployment verified on the live URL.

## Follow-up Polish

- [P3] When operators publish route metadata, optionally add duration and named boarding-pier values to each route row; the current fallback correctly avoids fabricating them.

final result: passed
