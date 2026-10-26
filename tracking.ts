export const statuses = ['অর্ডার গ্রহণ করা হয়েছে', 'প্যাকেট প্রস্তুত হচ্ছে', 'ডেলিভারির পথে', 'ডেলিভারি সম্পন্ন', 'অর্ডার বাতিল'] as const;
export function normalizePhone(value: string) {
  const phone = value.trim().replace(/[০-৯]/g, d => String('০১২৩৪৫৬৭৮৯'.indexOf(d))).replace(/[\s()-]/g, '');
  return /^(?:\+?88)?01[3-9]\d{8}$/.test(phone) ? phone.slice(-11) : null;
}
export function normalizeNumber(value: string) {
  const number = value.trim().toUpperCase();
  return /^BM-[A-F0-9]{32}$/.test(number) ? number : null;
}
