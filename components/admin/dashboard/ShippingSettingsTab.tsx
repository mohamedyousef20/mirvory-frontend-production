// components/admin/ShippingSettingsTab.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { Truck, MapPin, Clock, DollarSign, Save, Package } from "lucide-react";
import { shippingSettingsService } from "@/lib/api";

interface ShippingSettingsData {
  freeShippingEnabled: boolean;
  freeShippingMinimum: number;
  shippingFee: number;
  freePickupShipping: boolean;
  freeMetroShipping: boolean;
  metroAreas: string[];
}

interface ShippingSettingsTabProps {
  isArabic: boolean;
}

export function ShippingSettingsTab({ isArabic }: ShippingSettingsTabProps) {
  const [settings, setSettings] = useState<ShippingSettingsData>({
    freeShippingEnabled: true,
    freeShippingMinimum: 1500,
    shippingFee: 70,
    freePickupShipping: true,
    freeMetroShipping: true,
    metroAreas: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newMetroArea, setNewMetroArea] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await shippingSettingsService.getShippingSettings();
        const data = response.data || response;
        setSettings(data);
      } catch (error) {
        console.error('Error fetching shipping settings:', error);
        toast.error('فشل في تحميل إعدادات الشحن');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await shippingSettingsService.updateShippingSettings(settings);
      toast.success('تم تحديث إعدادات الشحن بنجاح');
    } catch (error: any) {
      console.error('Error updating shipping settings:', error);
      toast.error(error.response?.data?.message || 'فشل في تحديث إعدادات الشحن');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMetroArea = () => {
    if (newMetroArea.trim()) {
      setSettings({
        ...settings,
        metroAreas: [...settings.metroAreas, newMetroArea.trim()]
      });
      setNewMetroArea("");
    }
  };

  const handleRemoveMetroArea = (index: number) => {
    setSettings({
      ...settings,
      metroAreas: settings.metroAreas.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {isArabic ? "إعدادات الشحن" : "Shipping Settings"}
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* General Free Shipping */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              {isArabic ? "الشحن المجاني العام" : "General Free Shipping"}
            </CardTitle>
            <CardDescription>
              {isArabic ? "إعدادات الشحن المجاني للطلبات" : "Free shipping settings for orders"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="freeShippingEnabled">
                {isArabic ? "تفعيل الشحن المجاني" : "Enable Free Shipping"}
              </Label>
              <Switch
                id="freeShippingEnabled"
                checked={settings.freeShippingEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, freeShippingEnabled: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="freeShippingMinimum">
                {isArabic ? "الحد الأدنى للشحن المجاني (ج.م)" : "Minimum Order for Free Shipping (EGP)"}
              </Label>
              <Input
                id="freeShippingMinimum"
                type="number"
                value={settings.freeShippingMinimum}
                onChange={(e) => setSettings({ ...settings, freeShippingMinimum: Number(e.target.value) })}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shippingFee">
                {isArabic ? "رسوم الشحن العادية (ج.م)" : "Normal Shipping Fee (EGP)"}
              </Label>
              <Input
                id="shippingFee"
                type="number"
                value={settings.shippingFee}
                onChange={(e) => setSettings({ ...settings, shippingFee: Number(e.target.value) })}
                min="0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pickup Shipping */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {isArabic ? "شحن الاستلام" : "Pickup Shipping"}
            </CardTitle>
            <CardDescription>
              {isArabic ? "إعدادات شحن نقاط الاستلام" : "Pickup point shipping settings"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="freePickupShipping">
                {isArabic ? "الشحن المجاني للاستلام" : "Free Pickup Shipping"}
              </Label>
              <Switch
                id="freePickupShipping"
                checked={settings.freePickupShipping}
                onCheckedChange={(checked) => setSettings({ ...settings, freePickupShipping: checked })}
              />
            </div>

            <div className="text-sm text-muted-foreground">
              {isArabic
                ? "عند التفعيل، تكون طلبات الاستلام مجانية بالكامل"
                : "When enabled, pickup orders are completely free"}
            </div>
          </CardContent>
        </Card>

        {/* Metro Free Shipping */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {isArabic ? "الشحن المجاني داخل المناطق" : "Metro Free Shipping"}
            </CardTitle>
            <CardDescription>
              {isArabic ? "إعدادات الشحن المجاني للمناطق المحددة" : "Free shipping for specific areas"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="freeMetroShipping">
                {isArabic ? "تفعيل الشحن المجاني للمناطق" : "Enable Metro Free Shipping"}
              </Label>
              <Switch
                id="freeMetroShipping"
                checked={settings.freeMetroShipping}
                onCheckedChange={(checked) => setSettings({ ...settings, freeMetroShipping: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label>
                {isArabic ? "المناطق التي تستفيد من الشحن المجاني" : "Areas that get free shipping"}
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder={isArabic ? "أضف منطقة جديدة..." : "Add new area..."}
                  value={newMetroArea}
                  onChange={(e) => setNewMetroArea(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddMetroArea()}
                />
                <Button onClick={handleAddMetroArea} type="button">
                  {isArabic ? "إضافة" : "Add"}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {settings.metroAreas.map((area, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-sm"
                  >
                    {area}
                    <button
                      onClick={() => handleRemoveMetroArea(index)}
                      className="text-slate-500 hover:text-red-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#1a4fba] hover:bg-[#1640a0]"
        >
          {saving ? (
            <>
              <Clock className="h-4 w-4 ml-2 animate-spin" />
              {isArabic ? "جاري الحفظ..." : "Saving..."}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 ml-2" />
              {isArabic ? "حفظ الإعدادات" : "Save Settings"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}