import { createServerFn } from "@tanstack/react-start";

// Public shop contact configuration, managed in Netlify rather than source code.
export const getContact = createServerFn({ method: "GET" }).handler(async () => {
  const configured = (process.env.BELIEVE_ME_CONTACT_PHONE || "")
    .trim()
    .replace(/[০-৯]/g, (digit) => String("০১২৩৪৫৬৭৮৯".indexOf(digit)))
    .replace(/[\s()-]/g, "");
  if (!/^(?:\+?88)?01[3-9]\d{8}$/.test(configured)) {
    return { phone: null };
  }
  return { phone: `880${configured.slice(-10)}` };
});
