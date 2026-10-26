# Believe Me architecture

This is a React 19 / TypeScript / TanStack Start storefront for a single seller in Dhonpur village, Cumilla. All customer copy is Bangla, except the Believe Me brand and clothing sizes. Currency is whole BDT formatted with bn-BD digits.

- `src/routes/index.tsx`: storefront, filtering/sorting, product-detail dialog, local cart, and order-request dialog.
- `src/data/products.ts`: authoritative sample catalog and price/image helpers. Product images and prices are explicitly samples.
- `src/data/contact.functions.ts`: reads the public shop phone from `BELIEVE_ME_CONTACT_PHONE` on the server, validates Bangladesh mobile formats, and returns only the normalized public number. Change it through Netlify environment settings and redeploy; no public settings editor is exposed.
- `src/routes/__root.tsx`: Bangla document language and finished sharing metadata.
- `src/styles.css`: warm cream / forest green visual system, responsive Android layouts, modal styling, and reduced-motion support.
- `public/img/`: generated illustrative sample photography. Serve through `/.netlify/images` to resize and convert to WebP.
- `public/__forms.html`: static Netlify Forms detection skeleton. Keep field names aligned exactly with the rendered form.
- `.netlify/features/netlify-forms`: feature activation marker; retain it.

Orders are requests collected by Netlify Forms, not paid transactions. The seller confirms availability, price, delivery fee, and delivery time by phone. Do not invent delivery fees, online payment integrations, or delivery coverage. Coverage is only ধনপুর গ্রাম, কুমিল্লা. All submitted subtotals require seller verification. No public order listing is exposed. Cart data only is stored locally on the device; name, phone and address are not retained there.

Browser APIs belong in effects and event handlers to preserve SSR. Use native dialog semantics for keyboard focus and Escape support. Keep Bangla form validation and request failure states. No account system is required.

The platform runs build validation automatically; do not run build, typecheck, development server or test commands in agent sessions. Read edited files to verify changes. Do not edit generated route trees manually. For local human development, use `netlify dev --port 8889`.
