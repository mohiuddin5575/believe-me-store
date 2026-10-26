# Believe Me

A Bangla storefront for a single seller serving Dhonpur village, Cumilla, Bangladesh. Includes six clearly labeled sample clothing and food products, BDT prices, search, category filters, sorting, product details with size selection, a cart saved on the customer's device, and a local-delivery order request form.

Built with React 19, TypeScript, TanStack Start, Lucide icons, and Netlify. Product images are served through Netlify Image CDN. Order requests are collected by Netlify Forms and available in the site's Forms dashboard. Prices and availability are confirmed by the seller by phone; no online payment is taken. Delivery charges are intentionally unspecified and excluded from the displayed product subtotal.

## Local development

Use Node 22.13+ and pnpm. Install with `pnpm install`, then run `netlify dev --port 8889`. Netlify Forms submission processing works on deployed sites. Use actual customer information when checking a deployed form, and check the spam folder if a submission is missing.

## Updating the store

Edit `src/data/products.ts` for product names, details, BDT prices, sizes, and image paths. Replace the sample photos in `public/img/` with actual product images before accepting real orders. Product subtotals sent through the form are customer-provided order requests, not verified charges; confirm quantities and prices against the catalog by phone.

## Change the public contact number without editing code

1. Open [Believe Me in Netlify](https://app.netlify.com/projects/bangla-ecommerce-store), then **Project configuration → Environment variables → Add a variable**.
2. Name it `BELIEVE_ME_CONTACT_PHONE` and enter your Bangladesh mobile number. Use your WhatsApp-registered number if you want both buttons to reach you. Local numbers beginning with `01` and international numbers beginning with `+8801` or `8801` are accepted. Bangla digits, spaces, hyphens and parentheses are supported.
3. Include the **Functions** scope (or all scopes) and the **Production** deploy context. Include Deploy Previews only if you also want the public number shown there. This number is intended to be public on your storefront; do not put a password or other private credential in this variable.
4. Save and trigger a new production deploy from **Deploys → Trigger deploy**. Environment changes require a new deploy. Reload the published site after it finishes.
5. Check the displayed number, tap **ফোন করুন**, and send a message through **হোয়াটসঅ্যাপে লিখুন** from a phone. The WhatsApp link opens a conversation; you still need to send the message. WhatsApp must be registered for that number.

To change it later, edit the same variable and deploy again. To remove the contact links, delete the variable and redeploy. A missing or invalid number shows a clearly labeled placeholder and disabled contact buttons; the cart and order form stay available. Visitors cannot edit the shop's contact configuration. No customer contact information is stored on their device.

## Receive order notifications on your phone

**Notification setup and delivery have not been configured or tested by this update.** Adding a contact number or opening WhatsApp does not enable automatic order notifications.

The simplest option is email notifications with alerts enabled in your phone's email app:

1. In the Netlify project, open **Forms** and find `believe-me-orders`. Under **Submission notifications**, choose **Add notification → Email notification** (the setting may also appear under **Project configuration → Notifications → Form submission notifications**).
2. Select `believe-me-orders`, enter the email address you read on your phone, and save. This is separate from the storefront's public phone number.
3. On your Android phone, sign into that mailbox, enable email sync and notifications for the mail app, and allow notifications in Android settings. Check spam or junk for mail from `formresponses@netlify.com`.
4. Submit one order request through the published storefront using your own real contact details and an address in ধনপুর গ্রাম, কুমিল্লা. Confirm it appears in Netlify **Forms → believe-me-orders → Verified submissions**, then confirm both the email and phone alert arrive. Check **Spam submissions** if the request is missing. Treat this as a test request, not a paid order.
5. Only consider notifications active after that end-to-end check succeeds. If email arrives but no phone alert appears, check the phone's mail-app notification and battery/background restrictions.

Automatic WhatsApp or SMS order alerts require a separately configured messaging provider and a secured integration, typically triggered through a Netlify Forms submission webhook. They are not enabled by this update. The contact button is for customer-initiated conversations. Keep order requests private in the Netlify dashboard; the seller must still verify prices, availability, delivery fees and timing by phone.
