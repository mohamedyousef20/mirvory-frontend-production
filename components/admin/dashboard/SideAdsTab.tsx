'use client'

/**
 * SideAdsTab — Admin dashboard tab for managing homepage side advertisements.
 *
 * Uses the sideAdService which first tries /api/side-ads then falls back
 * to the Announcements API (type='side_ad').
 */

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  Megaphone, ExternalLink, ImageIcon, Loader2,
} from 'lucide-react'
import { sideAdService, type SideAd } from '@/lib/api/services/sideAdService'

/* ─────────────────────────────────────────────────────────────────────────── */

interface SideAdsTabProps {
  isArabic: boolean
}

const EMPTY_FORM = {
  title: '',
  content: '',
  imageUrl: '',
  linkUrl: '',
  position: 'both' as 'left' | 'right' | 'both',
  isActive: true,
  startDate: '',
  endDate: '',
}

export function SideAdsTab({ isArabic }: SideAdsTabProps) {
  const ar = isArabic

  const [ads, setAds] = useState<SideAd[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<SideAd | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [imageUrlInput, setImageUrlInput] = useState('')

  /* ── Fetch ── */
  const fetchAds = useCallback(async () => {
    setLoading(true)
    try {
      const data = await sideAdService.getAll()
      setAds(data)
    } catch {
      toast.error(ar ? 'فشل تحميل الإعلانات' : 'Failed to load ads')
    } finally {
      setLoading(false)
    }
  }, [ar])

  useEffect(() => { fetchAds() }, [fetchAds])

  /* ── Form helpers ── */
  const openNew = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM })
    setImageUrlInput('')
    setShowForm(true)
  }

  const openEdit = (ad: SideAd) => {
    setEditing(ad)
    setForm({
      title: ad.title ?? '',
      content: ad.content ?? '',
      imageUrl: ad.imageUrl ?? '',
      linkUrl: ad.linkUrl ?? '',
      position: (ad.position as any) ?? 'both',
      isActive: ad.isActive,
      startDate: ad.startDate ? ad.startDate.substring(0, 10) : '',
      endDate: ad.endDate ? ad.endDate.substring(0, 10) : '',
    })
    setImageUrlInput(ad.imageUrl ?? '')
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error(ar ? 'العنوان مطلوب' : 'Title is required')
      return
    }

    // Validate URL fields
    if (form.imageUrl && !/^https?:\/\//.test(form.imageUrl)) {
      toast.error(ar ? 'رابط الصورة يجب أن يبدأ بـ http أو https' : 'Image URL must start with http/https')
      return
    }
    if (form.linkUrl && !/^(https?:\/\/|\/)/.test(form.linkUrl)) {
      toast.error(ar ? 'رابط الوجهة غير صالح' : 'Destination link is invalid')
      return
    }

    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        content: form.content.trim() || undefined,
        imageUrl: form.imageUrl.trim() || undefined,
        linkUrl: form.linkUrl.trim() || undefined,
        position: form.position,
        isActive: form.isActive,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      }

      if (editing) {
        await sideAdService.update(editing._id, payload)
        toast.success(ar ? 'تم تحديث الإعلان' : 'Ad updated')
      } else {
        await sideAdService.create(payload)
        toast.success(ar ? 'تم إنشاء الإعلان' : 'Ad created')
      }

      setShowForm(false)
      setEditing(null)
      await fetchAds()
    } catch {
      toast.error(ar ? 'حدث خطأ' : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (ad: SideAd) => {
    const ok = await sideAdService.toggle(ad._id, !ad.isActive)
    if (ok) {
      toast.success(ar
        ? (ad.isActive ? 'تم إيقاف الإعلان' : 'تم تفعيل الإعلان')
        : (ad.isActive ? 'Ad disabled' : 'Ad enabled'))
      await fetchAds()
    } else {
      toast.error(ar ? 'فشل التحديث' : 'Failed to update')
    }
  }

  const handleDelete = async (ad: SideAd) => {
    const msg = ar
      ? `هل تريد حذف الإعلان "${ad.title}"؟`
      : `Delete ad "${ad.title}"?`
    if (!window.confirm(msg)) return
    const ok = await sideAdService.delete(ad._id)
    if (ok) {
      toast.success(ar ? 'تم حذف الإعلان' : 'Ad deleted')
      await fetchAds()
    } else {
      toast.error(ar ? 'فشل الحذف' : 'Failed to delete')
    }
  }

  /* ── Render ── */
  return (
    <div className="space-y-6" dir={ar ? 'rtl' : 'ltr'}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#1a4fba]" />
            {ar ? 'إعلانات الصفحة الرئيسية' : 'Homepage Side Advertisements'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {ar
              ? 'تُعرض على جانبي الصفحة الرئيسية — يمكن ربطها بصورة ورابط.'
              : 'Displayed on homepage sidebars — link each ad to an image and URL.'}
          </p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="w-4 h-4" />
          {ar ? 'إعلان جديد' : 'New Ad'}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-slate-800">
            {editing
              ? (ar ? 'تعديل الإعلان' : 'Edit Ad')
              : (ar ? 'إضافة إعلان جديد' : 'Add New Ad')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{ar ? 'العنوان *' : 'Title *'}</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder={ar ? 'عنوان الإعلان' : 'Ad title'}
                className="mt-1"
              />
            </div>

            <div>
              <Label>{ar ? 'رابط الصفحة المستهدفة' : 'Destination Link'}</Label>
              <Input
                value={form.linkUrl}
                onChange={(e) => setForm((p) => ({ ...p, linkUrl: e.target.value }))}
                placeholder="https://example.com/offer"
                dir="ltr"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>{ar ? 'الوصف (اختياري)' : 'Description (optional)'}</Label>
            <Textarea
              value={form.content}
              onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
              placeholder={ar ? 'وصف مختصر للإعلان' : 'Short ad description'}
              rows={2}
              className="mt-1"
            />
          </div>

          {/* Image URL */}
          <div>
            <Label>{ar ? 'رابط الصورة (URL)' : 'Image URL'}</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="https://..."
                dir="ltr"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setForm((p) => ({ ...p, imageUrl: imageUrlInput.trim() }))}
                className="shrink-0"
              >
                <ImageIcon className="w-4 h-4 me-1" />
                {ar ? 'تطبيق' : 'Apply'}
              </Button>
            </div>
            {form.imageUrl && (
              <img
                src={form.imageUrl}
                alt="preview"
                className="mt-2 h-28 w-auto rounded-lg border object-cover"
                onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>{ar ? 'الموضع' : 'Position'}</Label>
              <select
                value={form.position}
                onChange={(e) => setForm((p) => ({ ...p, position: e.target.value as any }))}
                className="mt-1 w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm"
              >
                <option value="both">{ar ? 'الجانبان' : 'Both sides'}</option>
                <option value="right">{ar ? 'الجانب الأيمن' : 'Right sidebar'}</option>
                <option value="left">{ar ? 'الجانب الأيسر' : 'Left sidebar'}</option>
              </select>
            </div>

            <div>
              <Label>{ar ? 'تاريخ البدء' : 'Start Date'}</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <Label>{ar ? 'تاريخ الانتهاء' : 'End Date'}</Label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium">
                {ar ? 'مفعّل فور الحفظ' : 'Active immediately'}
              </span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin me-2" />}
              {ar ? 'حفظ الإعلان' : 'Save Ad'}
            </Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null) }}>
              {ar ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        </div>
      )}

      {/* Ads List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : ads.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Megaphone className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="font-medium">{ar ? 'لا توجد إعلانات بعد' : 'No ads yet'}</p>
          <p className="text-sm mt-1">{ar ? 'أضف إعلانك الأول من الزر أعلاه' : 'Add your first ad using the button above'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ads.map((ad) => (
            <div key={ad._id}
              className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${ad.isActive ? 'border-green-200' : 'border-slate-200 opacity-70'}`}>
              {/* Image preview */}
              {ad.imageUrl ? (
                <div className="relative h-40 bg-slate-100">
                  <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                    onError={(e) => ((e.target as HTMLImageElement).parentElement!.style.display = 'none')}
                  />
                </div>
              ) : (
                <div className="h-20 bg-gradient-to-br from-[#0d2f75] to-[#2465d4] flex items-center justify-center">
                  <p className="text-white text-sm font-bold px-3 text-center">{ad.title}</p>
                </div>
              )}

              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-800 leading-tight">{ad.title}</p>
                    {ad.content && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{ad.content}</p>}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${ad.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {ad.isActive ? (ar ? 'مفعّل' : 'Active') : (ar ? 'موقف' : 'Inactive')}
                  </span>
                </div>

                {/* Position */}
                <p className="text-xs text-slate-500">
                  {ar ? 'الموضع: ' : 'Position: '}
                  <span className="font-medium">
                    {ad.position === 'left' ? (ar ? 'يسار' : 'Left')
                      : ad.position === 'right' ? (ar ? 'يمين' : 'Right')
                      : (ar ? 'الجانبان' : 'Both')}
                  </span>
                </p>

                {ad.linkUrl && (
                  <a
                    href={ad.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#1a4fba] hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {ad.linkUrl.length > 35 ? ad.linkUrl.substring(0, 35) + '…' : ad.linkUrl}
                  </a>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={() => handleToggle(ad)} className="flex-1 gap-1 text-xs">
                    {ad.isActive ? <ToggleRight className="w-3.5 h-3.5 text-green-600" /> : <ToggleLeft className="w-3.5 h-3.5 text-slate-400" />}
                    {ad.isActive ? (ar ? 'إيقاف' : 'Disable') : (ar ? 'تفعيل' : 'Enable')}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openEdit(ad)} className="px-2">
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(ad)} className="px-2 text-red-500 hover:text-red-700 hover:border-red-300">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
