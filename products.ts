export interface Product {
  id: number;
  name: string;
  image: string;
  description: string;
  shortDescription: string;
  price: number;
  oldPrice?: number;
  category: string;
  unit: string;
  badge?: string;
  options: string[];
}
const products: Product[] = [
  {
    id: 1,
    name: "সুতি এমব্রয়ডারি পাঞ্জাবি",
    image: "/img/product-1.jpg",
    description:
      "সেজ গ্রিন রঙের নরম সুতি পাঞ্জাবি, সূক্ষ্ম এমব্রয়ডারিতে সাজানো। ঠান্ডা পানিতে আলাদা করে ধুয়ে নিন।",
    shortDescription: "আরাম আর ঐতিহ্যের সুন্দর মেলবন্ধন",
    price: 1250,
    oldPrice: 1450,
    category: "clothes",
    unit: "প্রতি পিস",
    badge: "জনপ্রিয়",
    options: ["M", "L", "XL"],
  },
  {
    id: 2,
    name: "খাঁটি প্রাকৃতিক মধু",
    image: "/img/product-2.jpg",
    description:
      "সকালের নাশতা কিংবা চায়ের সঙ্গে মধুর স্বাদ। শুকনো চামচ ব্যবহার করুন। এক বছরের কম বয়সী শিশুকে দেবেন না। উৎস ও মেয়াদ ফোনে নিশ্চিত করা হবে।",
    shortDescription: "প্রকৃতির মিষ্টতা, প্রতিদিনের যত্নে",
    price: 450,
    category: "food",
    unit: "৫০০ গ্রাম",
    badge: "পছন্দের খাবার",
    options: ["৫০০ গ্রাম"],
  },
  {
    id: 3,
    name: "দেশি সুতি শাড়ি",
    image: "/img/product-3.jpg",
    description:
      "টেরাকোটা রঙের সুতির শাড়ি, সোনালি পাড়ের পরিমিত সৌন্দর্য। হালকা ও আরামদায়ক। প্রথমবার আলাদা করে হাতে ধুয়ে নিন।",
    shortDescription: "দেশি বুননে চেনা ভালোবাসা",
    price: 1450,
    oldPrice: 1650,
    category: "clothes",
    unit: "প্রতি পিস",
    options: ["ফ্রি সাইজ"],
  },
  {
    id: 4,
    name: "ঘরোয়া আমের আচার",
    image: "/img/product-4.jpg",
    description:
      "আম ও মসলার টক-ঝাল স্বাদের আচার। সরিষা থাকতে পারে। উপকরণ, উৎপাদন ও মেয়াদ অর্ডার নিশ্চিতের সময় জেনে নিন।",
    shortDescription: "টক-ঝালে ঘরের চেনা স্বাদ",
    price: 250,
    category: "food",
    unit: "২৫০ গ্রাম",
    badge: "ঘরোয়া স্বাদ",
    options: ["২৫০ গ্রাম"],
  },
  {
    id: 5,
    name: "প্রিমিয়াম কটন টি-শার্ট",
    image: "/img/product-5.jpg",
    description:
      "ক্রিম রঙের নরম কটন টি-শার্ট। প্রতিদিনের আরামদায়ক পোশাক। ছায়ায় শুকিয়ে নিন।",
    shortDescription: "প্রতিদিনের জন্য সহজ আরাম",
    price: 450,
    category: "clothes",
    unit: "প্রতি পিস",
    options: ["M", "L", "XL"],
  },
  {
    id: 6,
    name: "নারকেলের নাড়ু",
    image: "/img/product-6.jpg",
    description:
      "নারকেল ও গুড়ের ঐতিহ্যবাহী মিষ্টি। অ্যালার্জির তথ্য ও সংরক্ষণের মেয়াদ অর্ডার নিশ্চিতের সময় জেনে নিন।",
    shortDescription: "ছোট্ট মিষ্টিতে অনেকটা ভালোবাসা",
    price: 180,
    category: "food",
    unit: "১০ পিস",
    options: ["১০ পিস"],
  },
];
export const taka = (n: number) => `৳ ${n.toLocaleString("bn-BD")}`;
export const imageUrl = (p: string, w = 600) =>
  `/.netlify/images?url=${encodeURIComponent(p)}&w=${w}&fm=webp`;
export default products;
