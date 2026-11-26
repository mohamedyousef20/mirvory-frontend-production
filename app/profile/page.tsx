'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authService, userService } from '@/lib/api';
import { unwrapUser } from '@/lib/unwrap-user';
import { PageShell, Card } from '@/components/stitch/PageKit';

const TIERS: Record<string, string> = { bronze: 'برونزي', silver: 'فضي', gold: 'ذهبي', platinum: 'بلاتيني' };
const ROLES: Record<string, string> = { admin: 'مدير', super_admin: 'مدير', seller: 'تاجر' };
const PHONE_RE = /^\+?\d{10,15}$/;

const Icon = ({ n, className = '' }: { n: string; className?: string }) => (
  <span aria-hidden className={`material-symbols-outlined ${className}`}>{n}</span>
);

const inputCls =
  'h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[15px] text-slate-900 outline-none transition focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 disabled:bg-slate-50 disabled:text-slate-500';

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-bold text-slate-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[12px] text-slate-500">{hint}</span>}
    </label>
  );
}

function SkeletonProfile() {
  return (
    <PageShell narrow={false}>
      <div className="animate-pulse space-y-4" aria-busy="true" aria-label="جاري تحميل الحساب">
        <div className="h-32 rounded-[1.25rem] bg-slate-200/70" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-slate-200/70" />)}
        </div>
        <div className="h-72 rounded-[1.25rem] bg-slate-200/70" />
      </div>
    </PageShell>
  );
}

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [tab, setTab] = useState<'info' | 'security'>('info');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '' });
  const [formErr, setFormErr] = useState<Record<string, string>>({});
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [pwErr, setPwErr] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setFailed(false);
    try {
      const u = unwrapUser(await authService.getMe());
      if (!u) throw new Error('no user');
      setUser(u);
      setForm({ firstName: u.firstName || '', lastName: u.lastName || '', phone: u.phone || '' });
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (form.firstName.trim().length < 2) err.firstName = 'اكتب الاسم الأول (حرفين على الأقل)';
    if (form.lastName.trim().length < 2) err.lastName = 'اكتب الاسم الأخير (حرفين على الأقل)';
    if (!PHONE_RE.test(form.phone.replace(/\s/g, ''))) err.phone = 'رقم موبايل صحيح، أرقام فقط (مثال 01012345678)';
    setFormErr(err);
    if (Object.keys(err).length) return;
    setSaving(true);
    try {
      await userService.updateProfile({ firstName: form.firstName.trim(), lastName: form.lastName.trim(), phone: form.phone.replace(/\s/g, '') } as any);
      toast.success('تم حفظ بياناتك');
      setEditing(false);
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'ماقدرناش نحفظ البيانات، جرب تاني');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwErr('');
    if (!pw.currentPassword || !pw.newPassword || !pw.confirmPassword) return setPwErr('املأ كل الحقول');
    if (pw.newPassword.length < 8) return setPwErr('كلمة السر الجديدة 8 أحرف على الأقل');
    if (pw.newPassword !== pw.confirmPassword) return setPwErr('كلمة السر الجديدة والتأكيد مش متطابقين');
    if (pw.currentPassword === pw.newPassword) return setPwErr('كلمة السر الجديدة لازم تختلف عن الحالية');
    setPwSaving(true);
    try {
      await authService.changePassword(pw);
      setPw({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('تم تغيير كلمة السر، سجل دخول تاني');
      setTimeout(() => router.push('/auth/login'), 1800);
    } catch (e: any) {
      setPwErr(e?.response?.data?.message || 'ماقدرناش نغير كلمة السر، تأكد من الحالية وجرب تاني');
    } finally {
      setPwSaving(false);
    }
  };

  if (loading && !user) return <SkeletonProfile />;

  if (failed || !user) {
    return (
      <PageShell>
        <Card className="p-8 text-center">
          <Icon n="lock_person" className="mb-3 text-[44px] text-slate-400" />
          <h1 className="text-lg font-extrabold">مقدرناش نفتح حسابك</h1>
          <p className="mt-1 text-sm text-slate-500">ممكن الجلسة خلصت. سجل دخول وجرب تاني.</p>
          <div className="mt-5 flex justify-center gap-3">
            <button onClick={load} className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold">إعادة المحاولة</button>
            <Link href="/auth/login" className="flex h-11 items-center rounded-xl bg-[#004ac6] px-5 text-sm font-bold text-white">تسجيل الدخول</Link>
          </div>
        </Card>
      </PageShell>
    );
  }

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'حسابي';
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` || 'M';
  const points = user.loyalty?.points ?? 0;
  const tier = TIERS[user.loyalty?.tier] || 'برونزي';
  const role = ROLES[user.role];
  const addr = user.address?.addressLine || user.address?.city ? [user.address?.addressLine, user.address?.city].filter(Boolean).join('، ') : '';
  const isAdmin = ['admin', 'super_admin'].includes(String(user.role));

  const shortcuts: [string, string, string][] = [
    ['receipt_long', 'طلباتي', '/orders'],
    ['local_shipping', 'تتبع الشحنة', '/track-order'],
    ['assignment_return', 'مرتجعات واستبدال', '/returns'],
    ['workspace_premium', 'نادي ميرفوري', '/loyalty'],
    ['favorite', 'المفضلة', '/wishlist'],
    ...(isAdmin ? [['dashboard', 'لوحة الأدمن', '/admin/dashboard'] as [string, string, string]] : []),
    ...(user.role === 'seller' ? [['storefront', 'لوحة البائع', '/vendor/dashboard'] as [string, string, string]] : []),
  ];

  return (
    <PageShell narrow={false}>
      <div className="mx-auto max-w-4xl space-y-4">
        <Card className="p-5 md:p-6">
          <div className="flex items-center gap-4">
            <div aria-hidden className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#dbeafe] text-xl font-extrabold text-[#004ac6] md:h-20 md:w-20">{initials}</div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-extrabold text-slate-900 md:text-2xl">{fullName}</h1>
              <p dir="ltr" className="truncate text-right text-[13px] text-slate-500">{user.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {role && <span className="rounded-full bg-slate-100 px-3 py-1 text-[12px] font-bold text-slate-700">{role}</span>}
                {user.isVerified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-bold text-emerald-700"><Icon n="verified" className="text-[15px]" />الإيميل متأكد منه</span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-[12px] font-bold text-amber-700"><Icon n="mail" className="text-[15px]" />الإيميل لسه متأكدش منه</span>
                )}
              </div>
            </div>
          </div>
          {!user.isVerified && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-amber-50 p-3">
              <p className="text-[13px] text-amber-900">أكد إيميلك عشان توصلك تحديثات الطلب وتقدر تسترجع حسابك.</p>
              <Link href="/verifyEmail" className="shrink-0 rounded-lg bg-amber-500 px-4 py-2 text-[13px] font-bold text-white">أكد الإيميل</Link>
            </div>
          )}
        </Card>

        <Link href="/loyalty" className="flex items-center justify-between rounded-[1.25rem] bg-gradient-to-l from-[#004ac6] to-[#2563eb] p-4 text-white shadow-[0_2px_10px_rgba(0,74,198,0.25)]">
          <div className="flex items-center gap-3">
            <Icon n="workspace_premium" className="text-[30px]" />
            <div>
              <p className="text-[13px] opacity-80">نادي ميرفوري · مستوى {tier}</p>
              <p className="text-lg font-extrabold">{points.toLocaleString('en-US')} نقطة</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-[13px] font-bold">التفاصيل<Icon n="chevron_left" className="text-[20px]" /></span>
        </Link>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {shortcuts.map(([ic, t, h]) => (
            <Link key={h} href={h} className="flex min-h-[64px] items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition active:scale-[0.98]">
              <Icon n={ic} className="text-[24px] text-[#004ac6]" />
              <span className="text-[14px] font-bold text-slate-800">{t}</span>
            </Link>
          ))}
        </div>

        <div role="tablist" className="flex gap-2 rounded-2xl bg-slate-100 p-1">
          {([['info', 'بياناتي'], ['security', 'الأمان']] as const).map(([k, l]) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`h-11 flex-1 rounded-xl text-[14px] font-bold transition ${tab === k ? 'bg-white text-[#004ac6] shadow-sm' : 'text-slate-500'}`}>{l}</button>
          ))}
        </div>

        {tab === 'info' && (
          <Card className="p-5 md:p-6">
            <form onSubmit={saveProfile} noValidate className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="الاسم الأول">
                  <input className={inputCls} disabled={!editing} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} autoComplete="given-name" />
                  {formErr.firstName && <span role="alert" className="mt-1 block text-[12px] text-red-600">{formErr.firstName}</span>}
                </Field>
                <Field label="الاسم الأخير">
                  <input className={inputCls} disabled={!editing} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} autoComplete="family-name" />
                  {formErr.lastName && <span role="alert" className="mt-1 block text-[12px] text-red-600">{formErr.lastName}</span>}
                </Field>
              </div>
              <Field label="رقم الموبايل">
                <input dir="ltr" inputMode="tel" className={`${inputCls} text-right`} disabled={!editing} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" />
                {formErr.phone && <span role="alert" className="mt-1 block text-[12px] text-red-600">{formErr.phone}</span>}
              </Field>
              <Field label="الإيميل" hint="الإيميل مش بيتغير من هنا. لو محتاج تغيره كلمنا على واتساب.">
                <input dir="ltr" className={`${inputCls} text-right`} disabled value={user.email || ''} />
              </Field>
              {addr && (
                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                  <Icon n="location_on" className="text-[22px] text-slate-500" />
                  <div>
                    <p className="text-[12px] font-bold text-slate-500">آخر عنوان استخدمته</p>
                    <p className="text-[14px] text-slate-800">{addr}</p>
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-1">
                {editing ? (
                  <>
                    <button type="submit" disabled={saving} className="h-12 flex-1 rounded-xl bg-[#004ac6] text-[15px] font-bold text-white disabled:opacity-60">{saving ? 'بنحفظ...' : 'حفظ'}</button>
                    <button type="button" onClick={() => { setEditing(false); setFormErr({}); setForm({ firstName: user.firstName || '', lastName: user.lastName || '', phone: user.phone || '' }); }} className="h-12 rounded-xl border border-slate-200 px-6 text-[15px] font-bold text-slate-700">إلغاء</button>
                  </>
                ) : (
                  <button type="button" onClick={() => setEditing(true)} className="h-12 flex-1 rounded-xl border border-[#004ac6] text-[15px] font-bold text-[#004ac6]">تعديل البيانات</button>
                )}
              </div>
            </form>
          </Card>
        )}

        {tab === 'security' && (
          <Card className="p-5 md:p-6">
            <form onSubmit={changePassword} className="space-y-4">
              <Field label="كلمة السر الحالية">
                <input type={showPw ? 'text' : 'password'} className={inputCls} value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} autoComplete="current-password" />
              </Field>
              <Field label="كلمة السر الجديدة" hint="8 أحرف على الأقل">
                <input type={showPw ? 'text' : 'password'} className={inputCls} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} autoComplete="new-password" />
              </Field>
              <Field label="تأكيد كلمة السر الجديدة">
                <input type={showPw ? 'text' : 'password'} className={inputCls} value={pw.confirmPassword} onChange={(e) => setPw({ ...pw, confirmPassword: e.target.value })} autoComplete="new-password" />
              </Field>
              <label className="flex items-center gap-2 text-[13px] text-slate-600"><input type="checkbox" checked={showPw} onChange={(e) => setShowPw(e.target.checked)} className="h-4 w-4" />إظهار كلمات السر</label>
              {pwErr && <p role="alert" className="rounded-lg bg-red-50 p-3 text-[13px] text-red-700">{pwErr}</p>}
              <button type="submit" disabled={pwSaving} className="h-12 w-full rounded-xl bg-[#004ac6] text-[15px] font-bold text-white disabled:opacity-60">{pwSaving ? 'بنغير...' : 'تغيير كلمة السر'}</button>
            </form>
          </Card>
        )}

        <button onClick={() => router.push('/auth/logout')} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-white text-[15px] font-bold text-red-600">
          <Icon n="logout" className="text-[20px]" />تسجيل الخروج
        </button>
      </div>
    </PageShell>
  );
}
