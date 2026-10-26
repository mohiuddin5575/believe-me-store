import { useEffect, useState, type FormEvent } from 'react';
import { statuses } from '../data/tracking';

type Result = { number: string; status: string; updatedAt: string };
async function request(body: object): Promise<Result> {
  const response = await fetch('/api/tracking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'আবার চেষ্টা করুন।');
  return data;
}
export default function OrderTracking() {
  const [admin, setAdmin] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [invite, setInvite] = useState('');
  const [reset, setReset] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [status, setStatus] = useState<string>(statuses[0]);
  useEffect(() => {
    let active = true;
    import('@netlify/identity').then(async identity => {
      const callback = await identity.handleAuthCallback();
      const user = await identity.getUser();
      if (!active) return;
      if (callback) { setAdmin(true); document.getElementById('tracking')?.scrollIntoView(); }
      if (callback?.type === 'invite') setInvite(callback.token);
      if (callback?.type === 'recovery') setReset(true);
      setSignedIn(!!user);
    }).catch(() => { /* Storefront remains usable if Identity is unavailable. */ });
    return () => { active = false; };
  }, []);
  async function run(work: () => Promise<void>) {
    setBusy(true); setMessage('');
    try { await work(); } catch (error) { setMessage(error instanceof Error ? error.message : 'সংযোগ ব্যর্থ। আবার চেষ্টা করুন।'); }
    finally { setBusy(false); }
  }
  function lookup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const data = new FormData(e.currentTarget); setResult(null);
    void run(async () => {
      const found = await request({ number: data.get('number'), phone: data.get('phone'), action: admin ? 'adminLookup' : 'lookup' });
      setResult(found); setStatus(found.status);
    });
  }
  function authenticate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const data = new FormData(e.currentTarget);
    void run(async () => {
      const identity = await import('@netlify/identity');
      if (invite) { await identity.acceptInvite(invite, String(data.get('password'))); setInvite(''); }
      else if (reset) { await identity.updateUser({ password: String(data.get('password')) }); setReset(false); }
      else { await identity.login(String(data.get('email')), String(data.get('password'))); }
      setSignedIn(true); setMessage('লগইন হয়েছে। অবস্থা বদলাতে অ্যাডমিন অনুমতি থাকতে হবে।');
    });
  }
  return <section className="tracking-section" id="tracking">
    <div className="eyebrow">অর্ডারের খবর</div>
    <h2>{admin ? 'বিক্রেতার অর্ডার ব্যবস্থাপনা' : 'আপনার অর্ডার কোথায় আছে'}</h2>
    <p>{admin ? 'অনুমোদিত বিক্রেতা অর্ডার নম্বর দিয়ে অবস্থা পরিবর্তন করতে পারেন।' : 'অর্ডারের সময় পাওয়া নম্বর ও সেই মোবাইল নম্বর দিন। নম্বরটি কপি করে বা স্ক্রিনশট নিয়ে রাখুন।'}</p>
    {admin && (!signedIn || invite || reset) ? <form onSubmit={authenticate}>
      {!invite && !reset && <label>ইমেইল<input name="email" type="email" required autoComplete="username" /></label>}
      <label>{invite || reset ? 'নতুন পাসওয়ার্ড' : 'পাসওয়ার্ড'}<input name="password" type="password" required minLength={8} autoComplete={invite || reset ? 'new-password' : 'current-password'} /></label>
      <button className="primary" disabled={busy}>{busy ? 'অপেক্ষা করুন…' : invite || reset ? 'পাসওয়ার্ড সংরক্ষণ করুন' : 'লগইন করুন'}</button>
      {!invite && !reset && <button type="button" disabled={busy} onClick={e => {
        const form = e.currentTarget.form!; const email = String(new FormData(form).get('email') || '');
        if (!email || !form.querySelector<HTMLInputElement>('[name=email]')!.reportValidity()) return;
        void run(async () => { const identity = await import('@netlify/identity'); await identity.requestPasswordRecovery(email); setMessage('পাসওয়ার্ড বদলানোর লিংকের জন্য ইমেইল দেখুন।'); });
      }}>পাসওয়ার্ড ভুলে গেছেন</button>}
    </form> : <>
      <form onSubmit={lookup}>
        <label>অর্ডার নম্বর<input name="number" required maxLength={35} placeholder="BM-…" autoCapitalize="characters" autoComplete="off" /></label>
        {!admin && <label>অর্ডারের মোবাইল নম্বর<input name="phone" type="tel" required maxLength={20} autoComplete="tel" placeholder="০১XXXXXXXXX" /></label>}
        <button className="primary" disabled={busy}>{busy ? 'খোঁজা হচ্ছে…' : 'অর্ডারের অবস্থা দেখুন'}</button>
      </form>
      {result && <div className="tracking-result" role="status">
        <span className="order-number">{result.number}</span>
        <h3>{result.status}</h3>
        <p>সর্বশেষ পরিবর্তন: {new Date(result.updatedAt).toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' })}</p>
        {!admin && <p>প্রাপ্যতা, মূল্য, ডেলিভারি চার্জ ও সময় বিক্রেতা ফোনে নিশ্চিত করবেন।</p>}
        {admin && <><label>নতুন অবস্থা<select value={status} onChange={e => setStatus(e.target.value)}>{statuses.map(s => <option key={s}>{s}</option>)}</select></label>
          <button className="primary" disabled={busy} onClick={() => void run(async () => { const updated = await request({ action: 'update', number: result.number, status }); setResult(updated); setMessage('অর্ডারের অবস্থা সংরক্ষিত হয়েছে।'); })}>অবস্থা সংরক্ষণ করুন</button></>}
      </div>}
    </>}
    {message && <p role="alert" className="error">{message}</p>}
    <div className="tracking-actions">
      <button disabled={busy} onClick={() => { setAdmin(!admin); setResult(null); setMessage(''); }}>{admin ? 'ক্রেতার ট্র্যাকিং দেখুন' : 'বিক্রেতার লগইন'}</button>
      {signedIn && admin && <button disabled={busy} onClick={() => void run(async () => { const identity = await import('@netlify/identity'); await identity.logout(); setSignedIn(false); setResult(null); })}>লগআউট</button>}
    </div>
  </section>;
}
