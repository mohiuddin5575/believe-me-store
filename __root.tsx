import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";

import "../styles.css";

const siteName = "Believe Me | আপনার আস্থার অনলাইন দোকান";
const siteDescription =
  "পছন্দের পোশাক ও খাবার এখন এক ঠিকানায়। ধনপুর গ্রাম, কুমিল্লায় স্থানীয় ডেলিভারিতে সহজে অর্ডার করুন।";

export const Route = createRootRoute({
  head: () => ({
    links: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: siteName,
      },
      {
        name: "description",
        content: siteDescription,
      },
      {
        property: "og:title",
        content: siteName,
      },
      {
        property: "og:description",
        content: siteDescription,
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
