import { createFileRoute } from "@tanstack/react-router";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ArrowDown,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Heart,
  Leaf,
  MapPin,
  Menu,
  MessageCircle,
  Minus,
  PackageCheck,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Truck,
  X,
} from "lucide-react";
import products, { imageUrl, taka, type Product } from "../data/products";
import OrderTracking from "../components/OrderTracking";
import { getContact } from "../data/contact.functions";
export const Route = createFileRoute("/")({
  loader: () => getContact().catch(() => ({ phone: null })),
  component: Store,
});
type CartItem = { id: number; option: string; qty: number };
function Modal({
  children,
  onClose,
  label,
}: {
  children: ReactNode;
  onClose: () => void;
  label: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      aria-label={label}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button className="close" onClick={onClose} aria-label="বন্ধ করুন">
        <X size={22} />
      </button>
      {children}
    </dialog>
  );
}
function Store() {
  const { phone: contactPhone } = Route.useLoaderData();
  const displayPhone = contactPhone
    ? `+${contactPhone}`.replace(/\d/g, (digit) => "০১২৩৪৫৬৭৮৯"[Number(digit)])
    : "০১XXXXXXXXX";
  const orderNumberRef = useRef("");
  const [orderNumber, setOrderNumber] = useState("");
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState("all"),
    [sort, setSort] = useState("default"),
    [selected, setSelected] = useState<Product | null>(null),
    [option, setOption] = useState(""),
    [cart, setCart] = useState<CartItem[]>([]),
    [bag, setBag] = useState(false),
    [checkout, setCheckout] = useState(false),
    [sending, setSending] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(false),
    [toast, setToast] = useState(""),
    [menu, setMenu] = useState(false),
    [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("believe-me-cart") || "[]");
      if (Array.isArray(saved))
        setCart(
          saved.filter(
            (i) =>
              products.some(
                (p) => p.id === i.id && p.options.includes(i.option),
              ) &&
              Number.isInteger(i.qty) &&
              i.qty > 0 &&
              i.qty <= 20,
          ),
        );
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem("believe-me-cart", JSON.stringify(cart));
      } catch {}
    }
  }, [cart, ready]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(t);
  }, [toast]);
  const count = cart.reduce((s, i) => s + i.qty, 0),
    total = cart.reduce(
      (s, i) => s + products.find((p) => p.id === i.id)!.price * i.qty,
      0,
    );
  const visible = products
    .filter(
      (p) =>
        (category === "all" || p.category === category) &&
        (p.name + p.shortDescription + p.description).includes(query.trim()),
    )
    .sort((a, b) =>
      sort === "low"
        ? a.price - b.price
        : sort === "high"
          ? b.price - a.price
          : a.id - b.id,
    );
  function browse(cat = "all") {
    setCategory(cat);
    setMenu(false);
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  }
  function detail(p: Product) {
    setSelected(p);
    setOption(p.options[0]);
  }
  function add(p: Product, variant = p.options[0]) {
    setCart((old) => {
      const item = old.find((i) => i.id === p.id && i.option === variant);
      return item
        ? old.map((i) =>
            i === item ? { ...i, qty: Math.min(20, i.qty + 1) } : i,
          )
        : [...old, { id: p.id, option: variant, qty: 1 }];
    });
    setToast("পণ্যটি ব্যাগে যোগ হয়েছে");
  }
  function quantity(index: number, delta: number) {
    setCart((old) =>
      old
        .map((i, n) =>
          n === index ? { ...i, qty: Math.min(20, i.qty + delta) } : i,
        )
        .filter((i) => i.qty > 0),
    );
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!cart.length) return;
    setSending(true);
    setError("");
    const data = new FormData(e.currentTarget);
    const phone = String(data.get("phone") || "")
      .replace(/[০-৯]/g, (c) => String("০১২৩৪৫৬৭৮৯".indexOf(c)))
      .replace(/[\s-]/g, "");
    if (!/^(?:\+?88)?01[3-9]\d{8}$/.test(phone)) {
      setError("সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন 01XXXXXXXXX)।");
      setSending(false);
      return;
    }
    if (data.get("bot-field")) { setSending(false); return; }
    if (!orderNumberRef.current) orderNumberRef.current = `BM-${crypto.randomUUID().replaceAll("-", "").toUpperCase()}`;
    data.set("order-number", orderNumberRef.current);
    data.set("phone", phone);
    data.set(
      "items",
      cart
        .map((i) => {
          const p = products.find((p) => p.id === i.id)!;
          return `${p.name} (${i.option}) × ${i.qty} = ${taka(p.price * i.qty)}`;
        })
        .join("\n"),
    );
    data.set("subtotal", `${total} BDT`);
    try {
      const response = await fetch("/__forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(
          Array.from(data.entries()).map(([k, v]) => [k, String(v)]),
        ).toString(),
      });
      if (!response.ok) throw Error();
      setOrderNumber(orderNumberRef.current);
      orderNumberRef.current = "";
      setSuccess(true);
      setCart([]);
      setCheckout(false);
    } catch {
      setError("অর্ডার পাঠানো যায়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।");
    } finally {
      setSending(false);
    }
  }
  return (
    <>
      <div className="announcement">
        <MapPin size={14} />
        <span>আপনার এলাকার দোকান, এখন অনলাইনে</span>
        <i />
        ধনপুর গ্রাম, কুমিল্লায় ডেলিভারি
      </div>
      <header>
        <div className="header-inner">
          <a className="brand" href="/">
            Believe Me<span>আস্থায়, ভালোবাসায়।</span>
          </a>
          <div className="search-box">
            <Search size={19} />
            <input
              aria-label="পণ্য খুঁজুন"
              placeholder="আপনার পছন্দের পণ্য খুঁজুন..."
              onKeyDown={(e) => {
                if (e.key === "Enter") browse(category);
              }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              className="search-submit"
              aria-label="খোঁজার ফলাফল দেখুন"
              onClick={() => browse(category)}
            >
              খুঁজুন
            </button>
          </div>
          <button
            className="cart-button"
            aria-label={`আমার ব্যাগ, ${count.toLocaleString("bn-BD")}টি পণ্য`}
            onClick={() => {
              setBag(true);
              setSuccess(false);
            }}
          >
            <ShoppingBag size={21} />
            <span>আমার ব্যাগ</span>
            <b>{count.toLocaleString("bn-BD")}</b>
          </button>
          <button
            className="menu-button"
            aria-label="মেনু"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            <Menu />
          </button>
        </div>
        <nav className={menu ? "open" : ""}>
          <button
            className={category === "all" ? "active" : ""}
            onClick={() => browse()}
          >
            সব পণ্য
          </button>
          <button
            className={category === "clothes" ? "active" : ""}
            onClick={() => browse("clothes")}
          >
            পোশাক
          </button>
          <button
            className={category === "food" ? "active" : ""}
            onClick={() => browse("food")}
          >
            খাবার ও ঘরোয়া স্বাদ
          </button>
          <a href="#our-story" onClick={() => setMenu(false)}>
            আমাদের কথা
          </a>
          <a href="#tracking" onClick={() => setMenu(false)}>অর্ডার ট্র্যাকিং</a>
          <a href="#contact" onClick={() => setMenu(false)}>
            যোগাযোগ
          </a>
          <span>
            <MapPin size={15} /> শুধুমাত্র স্থানীয় ডেলিভারি
          </span>
        </nav>
      </header>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span /> আপনার আস্থার অনলাইন দোকান
            </div>
            <h1>
              চেনা মানুষের আস্থা,
              <br />
              পছন্দের <em>কেনাকাটা।</em>
            </h1>
            <p>
              আরামদায়ক পোশাক থেকে ঘরোয়া খাবার—
              <br />
              ভালো কিছু বেছে নিন, নিজের এলাকার দোকান থেকে।
            </p>
            <button className="primary" onClick={() => browse()}>
              কেনাকাটা শুরু করুন <ArrowRight size={18} />
            </button>
            <div className="hero-note">
              <ShieldCheck size={17} /> যত্নে বাছাই করা পণ্য <span>•</span> সহজে
              অর্ডার
            </div>
          </div>
          <div className="hero-visual">
            <img
              src={imageUrl("/img/hero.png", 1100)}
              alt="সুতি পোশাক, মধু ও ঘরোয়া আচারের যত্নে সাজানো সংগ্রহ"
              fetchPriority="high"
            />
            <div className="hero-stamp">
              <Heart size={19} />
              <span>
                আপনজনের মতো
                <br />
                <strong>যত্নে বাছাই</strong>
              </span>
            </div>
            <div className="image-caption">ছোট্ট দোকান, অনেকটা ভালোবাসা</div>
          </div>
        </section>
        <section className="assurances">
          <div>
            <Truck />
            <span>
              <strong>আপনার এলাকাতেই ডেলিভারি</strong>
              <small>ধনপুর গ্রাম, কুমিল্লা</small>
            </span>
          </div>
          <div>
            <Leaf />
            <span>
              <strong>ভালো মানের প্রতি যত্ন</strong>
              <small>বেছে নেওয়া পোশাক ও খাবার</small>
            </span>
          </div>
          <div>
            <PackageCheck />
            <span>
              <strong>অর্ডার করা একদম সহজ</strong>
              <small>পছন্দ করুন, তথ্য দিন, অর্ডার করুন</small>
            </span>
          </div>
          <div>
            <Heart />
            <span>
              <strong>একজন বিক্রেতা, সরাসরি আস্থা</strong>
              <small>আপনার পরিচিত Believe Me</small>
            </span>
          </div>
        </section>
        <section className="catalog" id="products">
          <div className="section-heading">
            <div>
              <div className="eyebrow">আপনার জন্য বেছে নেওয়া</div>
              <h2>
                আমাদের পণ্যের সংগ্রহ<span>।</span>
              </h2>
            </div>
            <p>ছোট ছোট পছন্দে, প্রতিদিনের ভালো থাকা।</p>
          </div>
          <div className="catalog-controls">
            <div className="tabs">
              <button
                className={category === "all" ? "chosen" : ""}
                onClick={() => setCategory("all")}
              >
                সব পণ্য <span>৬</span>
              </button>
              <button
                className={category === "clothes" ? "chosen" : ""}
                onClick={() => setCategory("clothes")}
              >
                পোশাক
              </button>
              <button
                className={category === "food" ? "chosen" : ""}
                onClick={() => setCategory("food")}
              >
                খাবার
              </button>
            </div>
            <label className="sort">
              <SlidersHorizontal size={15} />
              <select
                aria-label="পণ্য সাজান"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="default">সাজান: নির্বাচিত পণ্য</option>
                <option value="low">দাম: কম থেকে বেশি</option>
                <option value="high">দাম: বেশি থেকে কম</option>
              </select>
            </label>
          </div>
          <div className="catalog-meta">
            <span>
              {visible.length.toLocaleString("bn-BD")}টি পণ্য পাওয়া গেছে
            </span>
            <span>নমুনা পণ্যের সংগ্রহ</span>
          </div>
          <div className="product-grid">
            {visible.map((p) => (
              <article className="product" key={p.id}>
                <button
                  className="product-photo"
                  onClick={() => detail(p)}
                  aria-label={`${p.name} বিস্তারিত দেখুন`}
                >
                  <img src={imageUrl(p.image)} alt={p.name} loading="lazy" />
                  {p.badge && (
                    <span
                      className={`badge ${p.category === "food" ? "food" : ""}`}
                    >
                      {p.badge}
                    </span>
                  )}
                  <span className="photo-link">
                    <Plus size={19} />
                  </span>
                </button>
                <div className="product-info">
                  <small>
                    {p.category === "clothes" ? "পোশাক" : "খাবার"}{" "}
                    <span> / </span> {p.unit}
                  </small>
                  <button className="product-title" onClick={() => detail(p)}>
                    {p.name}
                  </button>
                  <p>{p.shortDescription}</p>
                  <div className="product-bottom">
                    <div className="price">
                      {taka(p.price)}{" "}
                      {p.oldPrice && <del>{taka(p.oldPrice)}</del>}
                    </div>
                    <button
                      className="add-button"
                      onClick={() =>
                        p.options.length > 1 ? detail(p) : add(p)
                      }
                      aria-label={`${p.name} ব্যাগে যোগ করুন`}
                    >
                      <Plus size={16} />
                      <span>ব্যাগে নিন</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {!visible.length && (
            <div className="empty">
              <Search size={32} />
              <h3>পণ্য পাওয়া যায়নি</h3>
              <p>অন্য নামে খুঁজুন বা সব পণ্য দেখুন।</p>
              <button
                className="primary"
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                }}
              >
                সব পণ্য দেখুন
              </button>
            </div>
          )}
        </section>
        <section className="local-banner">
          <div className="pin-circle">
            <MapPin size={30} />
          </div>
          <div>
            <div className="eyebrow">কাছের দোকান, কাছের মানুষ</div>
            <h2>আমরা পৌঁছে দিই আপনার এলাকাতেই।</h2>
            <p>
              বর্তমানে ডেলিভারি শুধু ধনপুর গ্রাম, কুমিল্লায়। ডেলিভারি চার্জ
              নির্ধারিত নয়;
              <br className="desktop" /> অর্ডার নিশ্চিত করার আগে ফোনে চার্জ ও
              সময় জানিয়ে দেওয়া হবে।
            </p>
          </div>
          <span className="location-pill">
            <span /> ধনপুর গ্রাম, কুমিল্লা
          </span>
        </section>
        <section className="story" id="our-story">
          <span className="story-mark">
            B<span>m.</span>
          </span>
          <div>
            <div className="eyebrow">Believe Me-এর কথা</div>
            <h2>আস্থা থেকেই শুরু, ভালোবাসায় পথচলা।</h2>
            <p>
              একজন বিক্রেতার ছোট্ট এই উদ্যোগে পোশাক আর খাবারের পসরা সাজিয়েছি
              আপনার জন্য। সহজ কেনাকাটা আর সরাসরি যোগাযোগে নিজের এলাকার মানুষদের
              পাশে থাকাই আমাদের চাওয়া।
            </p>
          </div>
          <a href="#products">
            আমাদের সংগ্রহ দেখুন <ArrowDown size={17} />
          </a>
        </section>
        <section className="contact-section" id="contact" aria-labelledby="contact-title">
          <div className="contact-copy">
            <div className="eyebrow">সরাসরি বিক্রেতার সঙ্গে কথা বলুন</div>
            <h2 id="contact-title">আমাদের সঙ্গে যোগাযোগ</h2>
            <p>পণ্য বা অর্ডার নিয়ে জানতে ফোন করুন বা হোয়াটসঅ্যাপে লিখুন।</p>
            <p className="contact-location"><MapPin size={16} /> ধনপুর গ্রাম, কুমিল্লা</p>
            <p className="contact-note">অর্ডারের অনুরোধ পাঠাতে আপনার ব্যাগের অর্ডার ফর্ম ব্যবহার করুন। প্রাপ্যতা, মূল্য, ডেলিভারি চার্জ ও সময় ফোনে নিশ্চিত করা হবে।</p>
          </div>
          <div className="contact-card">
            <span className="eyebrow">যোগাযোগের মোবাইল নম্বর</span>
            <strong className="contact-number" dir="ltr">{displayPhone}</strong>
            {contactPhone ? (
              <div className="contact-actions">
                <a className="primary" href={`tel:+${contactPhone}`}>
                  <Phone size={18} /> ফোন করুন
                </a>
                <a className="contact-whatsapp" href={`https://wa.me/${contactPhone}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={18} /> হোয়াটসঅ্যাপে লিখুন
                </a>
              </div>
            ) : (
              <>
                <p id="contact-unavailable">যোগাযোগের নম্বর শিগগিরই যোগ করা হবে। আপাতত অর্ডার ফর্মে অনুরোধ পাঠান।</p>
                <div className="contact-actions">
                  <button type="button" disabled aria-describedby="contact-unavailable"><Phone size={18} /> ফোন করুন</button>
                  <button type="button" disabled aria-describedby="contact-unavailable"><MessageCircle size={18} /> হোয়াটসঅ্যাপে লিখুন</button>
                </div>
              </>
            )}
            <small>হোয়াটসঅ্যাপ বাটন কথোপকথন খুলবে। এটি স্বয়ংক্রিয় অর্ডার বিজ্ঞপ্তি নয়।</small>
          </div>
        </section>
        <OrderTracking />
      </main>
      <footer>
        <div className="footer-top">
          <a className="brand" href="/">
            Believe Me<span>আস্থায়, ভালোবাসায়।</span>
          </a>
          <p>
            পোশাকে স্বস্তি, খাবারে তৃপ্তি।
            <br />
            আপনার প্রতিদিনের বিশ্বস্ত সঙ্গী।
          </p>
          <div>
            <MapPin size={17} />
            ধনপুর গ্রাম, কুমিল্লা, বাংলাদেশ
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            ©{" "}
            {new Date()
              .getFullYear()
              .toLocaleString("bn-BD", { useGrouping: false })}{" "}
            Believe Me। সর্বস্বত্ব সংরক্ষিত।
          </span>
          <span>বাংলাদেশের জন্য, ভালোবাসা নিয়ে।</span>
        </div>
      </footer>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}
      {selected && (
        <Modal label="পণ্যের বিস্তারিত" onClose={() => setSelected(null)}>
          <div className="detail">
            <img src={imageUrl(selected.image, 800)} alt={selected.name} />
            <div className="detail-content">
              <div className="eyebrow">
                {selected.category === "clothes" ? "পোশাক" : "খাবার"} · নমুনা
                পণ্য
              </div>
              <h2>{selected.name}</h2>
              <p>{selected.description}</p>
              <div className="price">
                {taka(selected.price)} <small>/ {selected.unit}</small>
              </div>
              <fieldset>
                <legend>
                  {selected.category === "clothes" ? "সাইজ বেছে নিন" : "পরিমাণ"}
                </legend>
                {selected.options.map((o) => (
                  <button
                    type="button"
                    className={option === o ? "option chosen" : "option"}
                    aria-pressed={option === o}
                    key={o}
                    onClick={() => setOption(o)}
                  >
                    {o}
                  </button>
                ))}
              </fieldset>
              <p className="detail-note">
                <MapPin size={16} /> শুধু ধনপুর গ্রাম, কুমিল্লায় ডেলিভারি
              </p>
              <button
                className="primary full"
                onClick={() => {
                  add(selected, option);
                  setSelected(null);
                }}
              >
                <ShoppingBag size={18} /> ব্যাগে যোগ করুন
              </button>
              <small>নমুনা ছবি ও দাম। প্রাপ্যতা ফোনে নিশ্চিত করা হবে।</small>
            </div>
          </div>
        </Modal>
      )}
      {bag && (
        <Modal
          label="আমার ব্যাগ ও অর্ডার"
          onClose={() => {
            if (!sending) {
              setBag(false);
              setCheckout(false);
            }
          }}
        >
          <div className="bag-content">
            {success ? (
              <div className="success">
                <CheckCircle2 size={54} />
                <h2>অর্ডারের অনুরোধ পেয়েছি!</h2>
                <p>আপনার অর্ডার নম্বর</p>
                <strong className="order-number">{orderNumber}</strong>
                <p>নম্বরটি কপি করে বা স্ক্রিনশট নিয়ে রাখুন। অর্ডার ট্র্যাকিংয়ে এই নম্বর ও মোবাইল নম্বর দিন। যাচাইয়ের পরে তথ্য দেখা যাবে।</p>
                <p>
                  পণ্যের প্রাপ্যতা, ডেলিভারি চার্জ ও সময় নিশ্চিত করতে আপনার
                  দেওয়া নম্বরে যোগাযোগ করা হবে।
                </p>
                <p>ডেলিভারি: ধনপুর গ্রাম, কুমিল্লা</p>
                <button
                  className="primary"
                  onClick={() => {
                    setBag(false);
                    setSuccess(false);
                  }}
                >
                  কেনাকাটা চালিয়ে যান
                </button>
              </div>
            ) : (
              <>
                <div className="eyebrow">আপনার পছন্দের পণ্য</div>
                <h2>
                  {checkout ? "অর্ডারের তথ্য" : "আমার ব্যাগ"}{" "}
                  <small>({count.toLocaleString("bn-BD")})</small>
                </h2>
                {!cart.length ? (
                  <div className="empty">
                    <ShoppingBag size={40} />
                    <h3>আপনার ব্যাগ এখন খালি</h3>
                    <p>পছন্দের পণ্য ব্যাগে যোগ করুন।</p>
                    <button
                      className="primary"
                      onClick={() => {
                        setBag(false);
                        browse();
                      }}
                    >
                      পণ্য দেখুন
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="cart-items">
                      {cart.map((i, n) => {
                        const p = products.find((p) => p.id === i.id)!;
                        return (
                          <div
                            className="cart-item"
                            key={`${i.id}-${i.option}`}
                          >
                            <img src={imageUrl(p.image, 160)} alt={p.name} />
                            <div>
                              <strong>{p.name}</strong>
                              <small>
                                {i.option} · {taka(p.price)}
                              </small>
                              <div className="quantity">
                                <button
                                  aria-label="পরিমাণ কমান"
                                  onClick={() => quantity(n, -1)}
                                  disabled={sending}
                                >
                                  <Minus size={14} />
                                </button>
                                <span>{i.qty.toLocaleString("bn-BD")}</span>
                                <button
                                  aria-label="পরিমাণ বাড়ান"
                                  onClick={() => quantity(n, 1)}
                                  disabled={i.qty >= 20 || sending}
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            </div>
                            <div className="line-price">
                              {taka(p.price * i.qty)}
                              <button
                                disabled={sending}
                                aria-label={`${p.name} সরান`}
                                onClick={() =>
                                  setCart((old) =>
                                    old.filter((_, idx) => idx !== n),
                                  )
                                }
                              >
                                <X size={15} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="totals">
                      <span>পণ্যের মোট মূল্য</span>
                      <strong>{taka(total)}</strong>
                    </div>
                    <p className="delivery-note">
                      ডেলিভারি চার্জ পরে ফোনে জানানো হবে। উপরের মূল্যে ডেলিভারি
                      চার্জ যোগ করা হয়নি।
                    </p>
                    {!checkout ? (
                      <button
                        className="primary full"
                        onClick={() => setCheckout(true)}
                      >
                        অর্ডার করতে এগিয়ে যান <ChevronRight size={18} />
                      </button>
                    ) : (
                      <form
                        name="believe-me-orders"
                        method="POST"
                        onSubmit={submit}
                      >
                        <input
                          type="hidden"
                          name="form-name"
                          value="believe-me-orders"
                        />
                        <input
                          type="hidden"
                          name="area"
                          value="ধনপুর গ্রাম, কুমিল্লা"
                        />
                        <input type="hidden" name="order-number" />
                        <input type="hidden" name="items" />
                        <input type="hidden" name="subtotal" />
                        <p hidden>
                          <label>
                            খালি রাখুন
                            <input
                              name="bot-field"
                              tabIndex={-1}
                              autoComplete="off"
                            />
                          </label>
                        </p>
                        <label>
                          আপনার নাম
                          <input
                            name="name"
                            required
                            minLength={2}
                            maxLength={100}
                            autoComplete="name"
                            placeholder="সম্পূর্ণ নাম লিখুন"
                          />
                        </label>
                        <label>
                          মোবাইল নম্বর
                          <input
                            name="phone"
                            type="tel"
                            required
                            maxLength={20}
                            autoComplete="tel"
                            placeholder="01XXXXXXXXX"
                          />
                        </label>
                        <label>
                          ডেলিভারি ঠিকানা
                          <textarea
                            name="address"
                            required
                            minLength={8}
                            maxLength={500}
                            autoComplete="street-address"
                            placeholder="বাড়ি, পাড়া / রাস্তা, ধনপুর গ্রাম, কুমিল্লা"
                            rows={3}
                          />
                        </label>
                        <label className="checkbox">
                          <input
                            name="local-confirmation"
                            type="checkbox"
                            value="confirmed"
                            required
                          />
                          <span>
                            আমার ঠিকানা ধনপুর গ্রাম, কুমিল্লার মধ্যে। ডেলিভারি
                            চার্জ ফোনে নিশ্চিত করা হবে।
                          </span>
                        </label>
                        {error && (
                          <p className="error" role="alert">
                            {error}
                          </p>
                        )}
                        <button
                          className="primary full"
                          disabled={sending || !cart.length}
                        >
                          {sending
                            ? "অর্ডার পাঠানো হচ্ছে..."
                            : "অর্ডারের অনুরোধ পাঠান"}
                          <Check size={18} />
                        </button>
                        <p className="form-note">
                          এখন কোনো টাকা দিতে হবে না। ফোনে কথা বলে অর্ডার ও মূল্য
                          নিশ্চিত করা হবে।
                        </p>
                      </form>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
