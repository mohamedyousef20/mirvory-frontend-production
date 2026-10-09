'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Plus, X, Palette, Calculator, ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import ImageUploader from '@/components/ImageUploader';
import { categoryService, productService } from '@/lib/api';
import { Textarea } from '@/components/ui/textarea';
import { ChromePicker } from 'react-color';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthProvider';
import Joi from 'joi';

interface ColorSize {
  size: string;
  quantity: number;
}

interface Color {
  name: string;
  value: string;
  image: string;
  available: boolean;
  sizes: ColorSize[];
}

// ── EditColorSizeManager sub-component ───────────────────────────────────────
interface EditColorSizeManagerProps {
  color: Color;
  language: string;
  onToggleAvailability: () => void;
  onRemove: () => void;
  onAddSize: (size: string, quantity: number) => void;
  onRemoveSize: (size: string) => void;
  onUpdateQty: (size: string, quantity: number) => void;
}

function EditColorSizeManager({ color, language, onToggleAvailability, onRemove, onAddSize, onRemoveSize, onUpdateQty }: EditColorSizeManagerProps) {
  const [newSize, setNewSize] = useState('');
  const [newQty, setNewQty] = useState(1);

  const SHOE_SIZES = ['37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];
  const CLOTH_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

  const handleAdd = () => {
    const s = newSize.trim();
    if (!s) return;
    onAddSize(s, Math.max(0, newQty));
    setNewSize(''); setNewQty(1);
  };

  const totalStock = color.sizes.reduce((sum, s) => sum + s.quantity, 0);

  return (
    <div className={`border-2 rounded-xl p-4 space-y-3 transition-colors ${color.available ? 'border-green-200 bg-green-50/20' : 'border-gray-200 bg-gray-50/50'}`}>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="w-9 h-9 rounded-full border-2 border-white shadow-md flex-shrink-0" style={{ backgroundColor: color.value }} />
        {color.image && <img src={color.image} alt={color.name} className="w-11 h-11 object-cover rounded-lg border-2 border-white shadow flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{color.name}</p>
          <p className="text-xs text-muted-foreground font-mono">{color.value}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 ms-auto">
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
            {language === 'ar' ? `إجمالي: ${totalStock}` : `Total: ${totalStock}`}
          </span>
          <button type="button" onClick={onToggleAvailability}
            className={`text-xs px-2 py-1 rounded-full border font-medium transition-colors ${color.available ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200' : 'bg-gray-100 text-gray-500 border-gray-300 hover:bg-gray-200'}`}>
            {color.available ? (language === 'ar' ? '✓ متاح' : '✓ Active') : (language === 'ar' ? 'غير متاح' : 'Inactive')}
          </button>
          <button type="button" onClick={onRemove}
            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
            <X size={15} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          {language === 'ar' ? 'المقاسات والكميات' : 'Sizes & Quantities'}
        </p>

        {color.sizes.length === 0 && (
          <p className="text-xs text-muted-foreground italic py-2 text-center">
            {language === 'ar' ? 'لم تُضف مقاسات — اختر من الأزرار أو أدخل يدوياً' : 'No sizes — pick presets or enter manually'}
          </p>
        )}

        {color.sizes.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-2">
            {color.sizes.map(({ size, quantity }) => (
              <div key={size} className="flex items-center gap-1.5 bg-white rounded-lg border border-slate-200 shadow-sm p-2">
                <span className="text-sm font-bold text-slate-700 min-w-[2rem] text-center">{size}</span>
                <input type="number" min="0" value={quantity}
                  onChange={e => onUpdateQty(size, Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-14 text-center text-sm border border-slate-200 rounded-md px-1 py-0.5 focus:ring-1 focus:ring-primary focus:outline-none" />
                <button type="button" onClick={() => onRemoveSize(size)}
                  className="text-red-300 hover:text-red-500 transition-colors">
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="pt-1 space-y-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{language === 'ar' ? 'مقاسات الأحذية:' : 'Shoe sizes:'}</p>
            <div className="flex gap-1 flex-wrap">
              {SHOE_SIZES.map(ps => {
                const added = color.sizes.some(s => s.size === ps);
                return (
                  <button key={ps} type="button" onClick={() => !added && setNewSize(ps)}
                    className={`px-2 py-1 text-xs rounded-lg border font-medium transition-colors ${
                      added ? 'bg-green-50 text-green-600 border-green-200 cursor-default' :
                      newSize === ps ? 'bg-primary text-primary-foreground border-primary' :
                      'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}>{added ? `✓ ${ps}` : ps}</button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">{language === 'ar' ? 'مقاسات الملابس:' : 'Clothing sizes:'}</p>
            <div className="flex gap-1 flex-wrap">
              {CLOTH_SIZES.map(ps => {
                const added = color.sizes.some(s => s.size === ps);
                return (
                  <button key={ps} type="button" onClick={() => !added && setNewSize(ps)}
                    className={`px-2 py-1 text-xs rounded-lg border font-medium transition-colors ${
                      added ? 'bg-green-50 text-green-600 border-green-200 cursor-default' :
                      newSize === ps ? 'bg-primary text-primary-foreground border-primary' :
                      'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}>{added ? `✓ ${ps}` : ps}</button>
                );
              })}
            </div>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <Input value={newSize} onChange={e => setNewSize(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
              placeholder={language === 'ar' ? 'مقاس مخصص' : 'Custom size'} className="w-28 h-9 text-sm" />
            <Input type="number" min="0" value={newQty} onChange={e => setNewQty(Math.max(0, parseInt(e.target.value) || 0))}
              placeholder={language === 'ar' ? 'الكمية' : 'Qty'} className="w-20 h-9 text-sm" />
            <Button type="button" onClick={handleAdd} size="sm" className="h-9 bg-primary hover:bg-primary/90">
              <Plus className="h-3.5 w-3.5 me-1" />{language === 'ar' ? 'إضافة مقاس' : 'Add size'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function EditProductPage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [product, setProduct] = useState<any>(null);

  const [sizeInput, setSizeInput] = useState('');

  const [colorInput, setColorInput] = useState({
    name: '',
    value: '#000000',
    available: true
  });

  const [colorImage, setColorImage] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: '',
    discountPercentage: '0',
    discountedPrice: '',
    category: '',
    images: [] as string[],
    deletedImages: [] as string[],
    deletedColorImages: [] as string[],
    brand: '',
    sizes: [] as string[],
    colors: [] as Color[],
    quantity: '0',
    isFeatured: false,
    isTrusted: false,
    status: 'available' as 'available' | 'pending',
    videoUrl: '',
  });


  /*
   * ============================================================
   * PRODUCT VALIDATION
   * ============================================================
   */

  const productValidationSchema = Joi.object({
    title: Joi.string()
      .trim()
      .min(3)
      .max(200)
      .required()
      .messages({
        'string.empty':
          language === 'ar'
            ? 'عنوان المنتج مطلوب'
            : 'Product title is required',
        'string.min':
          language === 'ar'
            ? 'اسم المنتج يجب ألا يقل عن 3 أحرف'
            : 'Title must be at least 3 characters',
        'any.required':
          language === 'ar'
            ? 'عنوان المنتج مطلوب'
            : 'Product title is required'
      }),

    description: Joi.string()
      .trim()
      .min(20)
      .max(5000)
      .required()
      .messages({
        'string.empty':
          language === 'ar'
            ? 'وصف المنتج مطلوب'
            : 'Product description is required',
        'string.min':
          language === 'ar'
            ? 'الوصف يجب ألا يقل عن 20 حرفًا'
            : 'Description must be at least 20 characters'
      }),

    price: Joi.number()
      .positive()
      .required()
      .messages({
        'number.base':
          language === 'ar'
            ? 'السعر يجب أن يكون رقمًا'
            : 'Price must be a number',
        'number.positive':
          language === 'ar'
            ? 'السعر يجب أن يكون أكبر من صفر'
            : 'Price must be greater than zero',
        'any.required':
          language === 'ar'
            ? 'السعر مطلوب'
            : 'Price is required'
      }),

    discountPercentage: Joi.number()
      .min(0)
      .max(100)
      .default(0)
      .messages({
        'number.min':
          language === 'ar'
            ? 'نسبة الخصم لا يمكن أن تقل عن 0%'
            : 'Discount cannot be less than 0%',
        'number.max':
          language === 'ar'
            ? 'نسبة الخصم لا يمكن أن تتجاوز 100%'
            : 'Discount cannot exceed 100%'
      }),

    category: Joi.string()
      .required()
      .messages({
        'any.required':
          language === 'ar'
            ? 'القسم / الفئة مطلوبة'
            : 'Category is required',
        'string.empty':
          language === 'ar'
            ? 'الرجاء اختيار الفئة'
            : 'Please select a category'
      }),

    brand: Joi.string()
      .trim()
      .max(100)
      .allow('')
      .default(''),

    quantity: Joi.number()
      .integer()
      .min(0)
      .required()
      .messages({
        'number.base':
          language === 'ar'
            ? 'الكمية يجب أن تكون رقمًا'
            : 'Quantity must be a number',
        'number.min':
          language === 'ar'
            ? 'الكمية يجب أن تكون أكبر من صفر'
            : 'Quantity must be greater than zero'
      }),

    images: Joi.array()
      .items(Joi.string().trim())
      .min(1)
      .required()
      .messages({
        'array.min':
          language === 'ar'
            ? 'يجب إضافة صورة واحدة على الأقل'
            : 'Please add at least one image'
      }),

    deletedImages: Joi.array().items(Joi.string().trim()).default([]),
    deletedColorImages: Joi.array().items(Joi.string().trim()).default([]),

    sizes: Joi.array()
      .items(
        Joi.string()
          .trim()
          .required()
          .max(50)
      )
      .default([]),

    colors: Joi.array()
      .items(
        Joi.object({
          _id: Joi.any().optional(),
          name: Joi.string()
            .trim()
            .required()
            .messages({
              'string.empty':
                language === 'ar'
                  ? 'اسم اللون مطلوب'
                  : 'Color name is required'
            }),
          value: Joi.string()
            .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
            .required()
            .messages({
              'string.pattern.base':
                language === 'ar'
                  ? 'قيمة اللون يجب أن تكون HEX صحيحة'
                  : 'Color value must be a valid HEX code'
            }),
          image: Joi.string()
            .trim()
            .required()
            .messages({
              'string.empty':
                language === 'ar'
                  ? 'صورة اللون مطلوبة'
                  : 'Color image is required'
            }),
          available: Joi.boolean()
            .default(true)
        })
      )
      .required()
      .default([]),

    isFeatured: Joi.boolean().default(false),
    isTrusted: Joi.boolean().default(false),

    status: Joi.string()
      .valid('available', 'pending')
      .default('available'),

    discountedPrice: Joi.any()
  });

  /*
   * ============================================================
   * FETCH PRODUCT & CATEGORIES
   * ============================================================
   */

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productResponse, categoriesResponse] = await Promise.all([
          productService.getProductById(id as string),
          categoryService.getCategories()
        ]);

        setProduct(productResponse.data.product);
        setCategories(categoriesResponse.data);

        const prod = productResponse.data.product;

        const cleanedColors = (prod.colors || []).map((color: any) => ({
          name: color.name,
          value: color.value,
          image: color.image,
          available: color.available !== false,
          // Preserve existing per-color sizes if available
          sizes: Array.isArray(color.sizes)
            ? color.sizes.map((s: any) => ({ size: String(s.size), quantity: Number(s.quantity) || 0 }))
            : []
        }));

        setNewProduct({
          title: prod.title || '',
          description: prod.description || '',
          price: prod.price?.toString() || '',
          discountPercentage: prod.discountPercentage?.toString() || '0',
          discountedPrice: prod.discountedPrice?.toString() || '',
          category: typeof prod.category === 'object' ? prod.category._id : prod.category,
          images: prod.images || [],
          deletedImages: [],
          deletedColorImages: [],
          brand: prod.brand || '',
          sizes: prod.sizes || [],
          colors: cleanedColors,
          quantity: prod.quantity?.toString() || '0',
          isFeatured: prod.isFeatured || false,
          isTrusted: prod.isTrusted || false,
          status: prod.status || 'available',
          videoUrl: prod.videoUrl || '',
        });
      } catch (error: any) {
        toast.error(
          language === 'ar'
            ? 'فشل في جلب بيانات المنتج'
            : 'Failed to fetch product data'
        );
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, language, router]);

  /*
   * ============================================================
   * CALCULATE DISCOUNTED PRICE
   * ============================================================
   */

  useEffect(() => {
    const price = parseFloat(newProduct.price) || 0;
    const discountPercentage = parseFloat(newProduct.discountPercentage) || 0;

    if (price > 0 && discountPercentage >= 0 && discountPercentage <= 100) {
      const discountAmount = price * (discountPercentage / 100);
      const calculatedDiscountedPrice = price - discountAmount;

      setNewProduct(prev => ({
        ...prev,
        discountedPrice: calculatedDiscountedPrice.toFixed(2)
      }));
    } else if (price > 0) {
      setNewProduct(prev => ({
        ...prev,
        discountedPrice: price.toFixed(2)
      }));
    }
  }, [newProduct.price, newProduct.discountPercentage]);

  /*
   * ============================================================
   * GENERAL INPUT HANDLERS
   * ============================================================
   */

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setNewProduct(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };

  /*
   * ============================================================
   * PRODUCT IMAGE MANAGEMENT
   * ============================================================
   */

  const handleImageUpload = (url: string) => {
    setNewProduct(prev => ({
      ...prev,
      images: [...prev.images, url]
    }));
    toast.success(
      language === 'ar'
        ? 'تم رفع الصورة بنجاح'
        : 'Image uploaded successfully'
    );
  };



  const removeImage = (index: number) => {
    setNewProduct(prev => {
      const newImages = [...prev.images];
      const removedImage = newImages[index];

      const deletedImages = [...prev.deletedImages, removedImage];

      newImages.splice(index, 1);

      return {
        ...prev,
        images: newImages,
        deletedImages
      };
    });
  };


  /*
   * ============================================================
   * SIZES
   * ============================================================
   */

  const addSize = () => {
    const size = sizeInput.trim();
    if (size && !newProduct.sizes.includes(size)) {
      setNewProduct(prev => ({
        ...prev,
        sizes: [...prev.sizes, size]
      }));
      setSizeInput('');
    }
  };

  const removeSize = (size: string) => {
    setNewProduct(prev => ({
      ...prev,
      sizes: prev.sizes.filter(s => s !== size)
    }));
  };

  /*
   * ============================================================
   * COLORS
   * ============================================================
   */

  const handleColorChange = (color: any) => {
    setColorInput(prev => ({ ...prev, value: color.hex }));
  };

  const addColor = () => {
    if (!colorInput.name.trim()) {
      toast.error(
        language === 'ar'
          ? 'الرجاء إدخال اسم اللون'
          : 'Please enter color name'
      );
      return;
    }

    if (!colorInput.value) {
      toast.error(
        language === 'ar'
          ? 'الرجاء اختيار لون'
          : 'Please select a color'
      );
      return;
    }

    if (!colorImage) {
      toast.error(
        language === 'ar'
          ? 'الرجاء إضافة صورة لهذا اللون'
          : 'Please add an image for this color'
      );
      return;
    }

    const colorExists = newProduct.colors.some(
      color => color.value.toLowerCase() === colorInput.value.toLowerCase()
    );

    if (colorExists) {
      toast.error(
        language === 'ar'
          ? 'هذا اللون مضاف مسبقاً'
          : 'This color already exists'
      );
      return;
    }

    const newColor: Color = {
      name: colorInput.name.trim(),
      value: colorInput.value,
      image: colorImage,
      available: colorInput.available,
      sizes: []
    };

    setNewProduct(prev => ({
      ...prev,
      colors: [...prev.colors, newColor]
    }));

    setColorInput({
      name: '',
      value: '#000000',
      available: true
    });
    setColorImage('');
    setShowColorPicker(false);

    toast.success(
      language === 'ar'
        ? 'تمت إضافة اللون بنجاح'
        : 'Color added successfully'
    );
  };

  const removeColor = (colorValue: string, colorImage: string) => {
    setNewProduct(prev => ({
      ...prev,
      colors: prev.colors.filter(color => color.value !== colorValue),
      deletedColorImages: [...prev.deletedColorImages, colorImage]
    }));
  };

  const toggleColorAvailability = (colorValue: string) => {
    setNewProduct(prev => ({
      ...prev,
      colors: prev.colors.map(color =>
        color.value === colorValue
          ? { ...color, available: !color.available }
          : color
      )
    }));
  };

  // ── Per-color size management ───────────────────────────────────────────────

  const addSizeToColor = (colorValue: string, size: string, quantity: number) => {
    if (!size.trim()) return;
    setNewProduct(prev => ({
      ...prev,
      colors: prev.colors.map(c => {
        if (c.value !== colorValue) return c;
        const existing = c.sizes.find((s: ColorSize) => s.size === size.trim());
        if (existing) {
          return { ...c, sizes: c.sizes.map((s: ColorSize) => s.size === size.trim() ? { ...s, quantity } : s) };
        }
        return { ...c, sizes: [...c.sizes, { size: size.trim(), quantity }] };
      })
    }));
  };

  const removeSizeFromColor = (colorValue: string, size: string) => {
    setNewProduct(prev => ({
      ...prev,
      colors: prev.colors.map(c =>
        c.value === colorValue ? { ...c, sizes: c.sizes.filter((s: ColorSize) => s.size !== size) } : c
      )
    }));
  };

  const updateSizeQuantity = (colorValue: string, size: string, quantity: number) => {
    setNewProduct(prev => ({
      ...prev,
      colors: prev.colors.map(c =>
        c.value === colorValue
          ? { ...c, sizes: c.sizes.map((s: ColorSize) => s.size === size ? { ...s, quantity } : s) }
          : c
      )
    }));
  };

  /*
   * ============================================================
   * SUBMIT PRODUCT UPDATE
   * ============================================================
   */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error(
        language === 'ar'
          ? 'يجب تسجيل الدخول أولاً'
          : 'Please log in first'
      );
      return;
    }

    const preparedDataToValidate = {
      ...newProduct,
      price: newProduct.price === '' ? undefined : parseFloat(newProduct.price),
      discountPercentage: parseFloat(newProduct.discountPercentage) || 0,
      quantity: parseInt(newProduct.quantity) || 0
    };

    const { error } = productValidationSchema.validate(preparedDataToValidate, {
      abortEarly: true
    });

    if (error) {
      toast.error(error.details[0].message);
      return;
    }

    setSaving(true);

    try {
      const productData = {
        title: newProduct.title,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        discountPercentage: parseFloat(newProduct.discountPercentage),
        discountedPrice: parseFloat(newProduct.discountedPrice) || parseFloat(newProduct.price),
        category: newProduct.category,
        brand: newProduct.brand,
        images: newProduct.images,
        deletedImages: newProduct.deletedImages,
        deletedColorImages: newProduct.deletedColorImages,
        sizes: newProduct.sizes,
        colors: newProduct.colors.map(({ name, value, image, available, sizes }) => ({
          name,
          value,
          image,
          available,
          sizes: sizes ?? [],
        })),
        quantity: parseInt(newProduct.quantity) || 0,
        isFeatured: newProduct.isFeatured,
        isTrusted: newProduct.isTrusted,
        status: newProduct.status,
        videoUrl: newProduct.videoUrl.trim() || undefined,
      };

      await productService.updateProduct(id as string, productData);

      toast.success(
        language === 'ar'
          ? 'تم تحديث المنتج بنجاح'
          : 'Product updated successfully'
      );

      router.back();
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error(
        error.response?.data?.message ||
        (language === 'ar'
          ? 'حدث خطأ أثناء تحديث المنتج'
          : 'Error updating product')
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  const ar = language === 'ar';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {ar ? 'رجوع' : 'Back'}
        </Button>
        <h1 className="text-3xl font-bold text-slate-800">
          {ar ? 'تعديل المنتج' : 'Edit Product'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {ar ? 'معلومات المنتج' : 'Product Information'}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title">
                {ar ? 'عنوان المنتج' : 'Product Title'} *
              </Label>
              <Input
                id="title"
                name="title"
                value={newProduct.title}
                onChange={handleInputChange}
                placeholder={ar ? 'أدخل عنوان المنتج' : 'Enter product title'}
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">
                {ar ? 'وصف المنتج' : 'Product Description'} *
              </Label>
              <Textarea
                id="description"
                name="description"
                value={newProduct.description}
                onChange={handleInputChange}
                placeholder={ar ? 'أدخل وصف المنتج' : 'Enter product description'}
                rows={4}
              />
            </div>

            {/* Price */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">
                  {ar ? 'السعر' : 'Price'} *
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="text"
                  value={newProduct.price}
                  onChange={handleNumberInputChange}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="discountPercentage">
                  {ar ? 'نسبة الخصم %' : 'Discount Percentage %'}
                </Label>
                <Input
                  id="discountPercentage"
                  name="discountPercentage"
                  type="text"
                  value={newProduct.discountPercentage}
                  onChange={handleNumberInputChange}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="discountedPrice">
                  {ar ? 'السعر بعد الخصم' : 'Discounted Price'}
                </Label>
                <Input
                  id="discountedPrice"
                  name="discountedPrice"
                  type="text"
                  value={newProduct.discountedPrice}
                  readOnly
                  className="bg-gray-100"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category">
                {ar ? 'الفئة' : 'Category'} *
              </Label>
              <Select
                value={newProduct.category}
                onValueChange={(value) => handleSelectChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={ar ? 'اختر الفئة' : 'Select category'} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Brand */}
            <div>
              <Label htmlFor="brand">
                {ar ? 'العلامة التجارية' : 'Brand'}
              </Label>
              <Input
                id="brand"
                name="brand"
                value={newProduct.brand}
                onChange={handleInputChange}
                placeholder={ar ? 'أدخل العلامة التجارية' : 'Enter brand'}
              />
            </div>

            {/* Quantity */}
            <div>
              <Label htmlFor="quantity">
                {ar ? 'الكمية' : 'Quantity'} *
              </Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                value={newProduct.quantity}
                onChange={handleNumberInputChange}
                min="0"
                placeholder="0"
              />
            </div>

            {/* Images */}
            <div>
              <Label>
                {ar ? 'صور المنتج' : 'Product Images'} *
              </Label>
              <div className="space-y-4">
                {/* Existing images */}
                {newProduct.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-4">
                    {newProduct.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <ImageUploader
                  onUpload={handleImageUpload}
                />
              </div>
            </div>

            {/* Video URL (optional) */}
            <div>
              <Label htmlFor="videoUrl">{ar ? 'رابط الفيديو (اختياري)' : 'Video URL (optional)'}</Label>
              <input
                id="videoUrl"
                type="url"
                value={newProduct.videoUrl}
                onChange={(e) => setNewProduct(prev => ({ ...prev, videoUrl: e.target.value }))}
                placeholder="https://www.youtube.com/watch?v=..."
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {ar ? 'روابط YouTube — سيظهر الفيديو في صفحة المنتج' : 'YouTube links — video will appear on the product page'}
              </p>
            </div>

            {/* Sizes */}
            <div>
              <Label>{ar ? 'المقاسات' : 'Sizes'}</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  placeholder={ar ? 'أضف مقاس' : 'Add size'}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                />
                <Button type="button" onClick={addSize}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {newProduct.sizes.map((size, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full"
                  >
                    <span>{size}</span>
                    <button
                      type="button"
                      onClick={() => removeSize(size)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div>
              <Label>{ar ? 'الألوان' : 'Colors'}</Label>
              <div className="space-y-4">
                <div className="flex gap-2 items-start">
                  <Input
                    value={colorInput.name}
                    onChange={(e) => setColorInput(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={ar ? 'اسم اللون' : 'Color name'}
                    className="flex-1"
                  />
                  <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-12 h-10"
                        style={{ backgroundColor: colorInput.value }}
                      />
                    </PopoverTrigger>
                    <PopoverContent>
                      <ChromePicker
                        color={colorInput.value}
                        onChange={handleColorChange}
                      />
                    </PopoverContent>
                  </Popover>
                  <ImageUploader
                    onUpload={(url) => setColorImage(url)}
                  />
                  <Button type="button" onClick={addColor}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {newProduct.colors.map((color, index) => (
                    <EditColorSizeManager
                      key={index}
                      color={color}
                      language={language}
                      onToggleAvailability={() => toggleColorAvailability(color.value)}
                      onRemove={() => removeColor(color.value, color.image)}
                      onAddSize={(size, qty) => addSizeToColor(color.value, size, qty)}
                      onRemoveSize={(size) => removeSizeFromColor(color.value, size)}
                      onUpdateQty={(size, qty) => updateSizeQuantity(color.value, size, qty)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Admin-specific fields */}
            <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
              <h3 className="font-semibold text-blue-800">
                {ar ? 'خيارات الأدمن' : 'Admin Options'}
              </h3>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={newProduct.isFeatured}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, isFeatured: e.target.checked }))}
                  className="w-4 h-4"
                />
                <Label htmlFor="isFeatured">
                  {ar ? 'منتج مميز' : 'Featured Product'}
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isTrusted"
                  checked={newProduct.isTrusted}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, isTrusted: e.target.checked }))}
                  className="w-4 h-4"
                />
                <Label htmlFor="isTrusted">
                  {ar ? 'منتج موثوق' : 'Trusted Product'}
                </Label>
              </div>

              <div>
                <Label htmlFor="status">
                  {ar ? 'الحالة' : 'Status'}
                </Label>
                <Select
                  value={newProduct.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">{ar ? 'متاح' : 'Available'}</SelectItem>
                    <SelectItem value="pending">{ar ? 'قيد المراجعة' : 'Pending'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Submit buttons */}
            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {ar ? 'جاري الحفظ...' : 'Saving...'}
                  </>
                ) : (
                  (ar ? 'حفظ التعديلات' : 'Save Changes')
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                {ar ? 'إلغاء' : 'Cancel'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}