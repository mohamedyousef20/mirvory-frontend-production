'use client'

import { useState, useEffect } from 'react';

import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Plus, X, Palette, Calculator } from 'lucide-react';
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

// ── ColorSizeManager sub-component ───────────────────────────────────────────
interface ColorSizeManagerProps {
  color: { name: string; value: string; image: string; available: boolean; sizes: { size: string; quantity: number }[] };
  language: string;
  onToggleAvailability: () => void;
  onRemove: () => void;
  onAddSize: (size: string, quantity: number) => void;
  onRemoveSize: (size: string) => void;
  onUpdateQty: (size: string, quantity: number) => void;
}

function ColorSizeManager({ color, language, onToggleAvailability, onRemove, onAddSize, onRemoveSize, onUpdateQty }: ColorSizeManagerProps) {
  const [newSize, setNewSize] = useState('');
  const [newQty, setNewQty] = useState(0);
  const PRESET_SIZES = ['41', '42', '43', '44', '45'];

  const handleAdd = () => {
    if (!newSize.trim()) return;
    onAddSize(newSize.trim(), newQty);
    setNewSize('');
    setNewQty(0);
  };

  return (
    <div className={`border rounded-xl p-4 space-y-3 ${color.available ? 'border-green-200 bg-green-50/30' : 'border-gray-200 bg-gray-50'}`}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-white shadow" style={{ backgroundColor: color.value }} />
        <img src={color.image} alt={color.name} className="w-10 h-10 object-cover rounded-lg border" />
        <span className="font-semibold text-sm">{color.name}</span>
        <span className="text-xs text-muted-foreground">{color.value}</span>
        <div className="flex items-center gap-1 ms-auto">
          <button type="button" onClick={onToggleAvailability}
            className={`text-xs px-2 py-1 rounded-full border ${color.available ? 'bg-green-100 text-green-700 border-green-300' : 'bg-gray-100 text-gray-500 border-gray-300'}`}>
            {color.available ? (language === 'ar' ? 'متاح ✓' : 'Available ✓') : (language === 'ar' ? 'غير متاح' : 'Unavailable')}
          </button>
          <button type="button" onClick={onRemove} className="text-red-500 hover:text-red-700 p-1 rounded">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Sizes for this color */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">{language === 'ar' ? 'المقاسات والكميات:' : 'Sizes & Quantities:'}</p>

        {color.sizes.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {color.sizes.map(({ size, quantity }) => (
              <div key={size} className="flex items-center gap-1 bg-white rounded-lg border p-2">
                <span className="text-sm font-medium w-8 text-center">{size}</span>
                <input
                  type="number" min="0" value={quantity}
                  onChange={e => onUpdateQty(size, parseInt(e.target.value) || 0)}
                  className="w-14 text-center text-sm border rounded px-1 py-0.5"
                />
                <button type="button" onClick={() => onRemoveSize(size)} className="text-red-400 hover:text-red-600">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add size row */}
        <div className="flex gap-2 items-center flex-wrap">
          <div className="flex gap-1 flex-wrap">
            {PRESET_SIZES.map(ps => (
              <button key={ps} type="button" onClick={() => setNewSize(ps)}
                className={`px-2 py-1 text-xs rounded border ${newSize === ps ? 'bg-primary text-primary-foreground' : 'bg-white hover:bg-gray-50'}`}>
                {ps}
              </button>
            ))}
          </div>
          <Input value={newSize} onChange={e => setNewSize(e.target.value)}
            placeholder={language === 'ar' ? 'مقاس' : 'Size'} className="w-20 h-8 text-sm" />
          <Input type="number" min="0" value={newQty} onChange={e => setNewQty(parseInt(e.target.value) || 0)}
            placeholder={language === 'ar' ? 'كمية' : 'Qty'} className="w-20 h-8 text-sm" />
          <Button type="button" onClick={handleAdd} size="sm" variant="outline" className="h-8">
            <Plus className="h-3 w-3 me-1" />
            {language === 'ar' ? 'إضافة' : 'Add'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface AddProductFormProps {
  onClose: () => void;
}

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

export default function AddProductForm({ onClose }: AddProductFormProps) {
  const { language } = useLanguage();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);

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
    brand: '',
    sizes: [] as string[],
    colors: [] as Color[],
    quantity: '0',
    isFeatured: false,
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
      .min(1)
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

    sizes: Joi.array()
      .items(
        Joi.string()
          .trim()
          .required()
          .max(50)
      )
      .default([]),

    /*
     * ============================================================
     * COLORS
     *
     * Every color MUST have:
     * name
     * value
     * image
     * available
     * ============================================================
     */

    colors: Joi.array()
      .items(
        Joi.object({
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

    status: Joi.string()
      .valid('available', 'pending')
      .default('available'),

    discountedPrice: Joi.any()
  });

  /*
   * ============================================================
   * PLATFORM FEE
   * ============================================================
   */

  function getPlatformFeeByPrice(price: number): number {
    if (!price || price <= 0) return 0.06;

    if (price < 300) return 0.12;

    if (price >= 300 && price <= 799) return 0.10;

    if (price >= 800 && price <= 1999) return 0.08;

    return 0.06;
  }

  /*
   * ============================================================
   * PRICE RANGE EXPLANATION
   * ============================================================
   */

  function getPriceRangeExplanation(
    price: number,
    language = 'ar'
  ): string {
    if (!price) return '';

    if (price < 300) {
      return language === 'ar'
        ? 'أقل من 300: رسوم المنصة 12%، نسبة البائع 88%'
        : 'Below 300: Platform fee 12%, Seller gets 88%';
    }

    if (price >= 300 && price <= 799) {
      return language === 'ar'
        ? '300-799: رسوم المنصة 10%، نسبة البائع 90%'
        : '300-799: Platform fee 10%, Seller gets 90%';
    }

    if (price >= 800 && price <= 1999) {
      return language === 'ar'
        ? '800-1999: رسوم المنصة 8%، نسبة البائع 92%'
        : '800-1999: Platform fee 8%, Seller gets 92%';
    }

    return language === 'ar'
      ? 'أكثر من 2000: رسوم المنصة 6%، نسبة البائع 94%'
      : 'Above 2000: Platform fee 6%, Seller gets 94%';
  }

  /*
   * ============================================================
   * PRICE CALCULATIONS
   * ============================================================
   */

  const discountedPrice =
    parseFloat(newProduct.discountedPrice) || 0;

  const platformFee =
    getPlatformFeeByPrice(discountedPrice);

  const sellerPercentage =
    1 - platformFee;

  const sellerAmount =
    discountedPrice > 0
      ? (
          discountedPrice * sellerPercentage
        ).toFixed(2)
      : '0.00';

  /*
   * ============================================================
   * FETCH CATEGORIES
   * ============================================================
   */

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response =
          await categoryService.getCategories();

        setCategories(response.data);
      } catch (error) {
        toast.error(
          language === 'ar'
            ? 'فشل جلب الفئات'
            : 'Failed to fetch categories'
        );
      }
    };

    fetchCategories();
  }, [language]);

  /*
   * ============================================================
   * CALCULATE DISCOUNTED PRICE
   * ============================================================
   */

  useEffect(() => {
    const price =
      parseFloat(newProduct.price) || 0;

    const discountPercentage =
      parseFloat(newProduct.discountPercentage) || 0;

    if (
      price > 0 &&
      discountPercentage >= 0 &&
      discountPercentage <= 100
    ) {
      const discountAmount =
        price * (discountPercentage / 100);

      const calculatedDiscountedPrice =
        price - discountAmount;

      setNewProduct(prev => ({
        ...prev,
        discountedPrice:
          calculatedDiscountedPrice.toFixed(2)
      }));
    } else if (price > 0) {
      setNewProduct(prev => ({
        ...prev,
        discountedPrice: price.toFixed(2)
      }));
    }
  }, [
    newProduct.price,
    newProduct.discountPercentage
  ]);

  /*
   * ============================================================
   * GENERAL INPUT HANDLERS
   * ============================================================
   */

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setNewProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    if (
      value === '' ||
      /^\d*\.?\d*$/.test(value)
    ) {
      setNewProduct(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSelectChange = (
    name: string,
    value: string
  ) => {
    setNewProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /*
   * ============================================================
   * PRODUCT IMAGE UPLOAD
   * ============================================================
   */

  const handleImageUpload = (url: string) => {
    setNewProduct(prev => ({
      ...prev,
      images: [
        ...prev.images,
        url
      ]
    }));

    toast.success(
      language === 'ar'
        ? 'تم رفع الصورة بنجاح'
        : 'Image uploaded successfully'
    );
  };

  const removeImage = (index: number) => {
    setNewProduct(prev => {
      const newImages = [
        ...prev.images
      ];

      newImages.splice(index, 1);

      return {
        ...prev,
        images: newImages
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

    if (
      size &&
      !newProduct.sizes.includes(size)
    ) {
      setNewProduct(prev => ({
        ...prev,
        sizes: [
          ...prev.sizes,
          size
        ]
      }));

      setSizeInput('');
    }
  };

  const removeSize = (size: string) => {
    setNewProduct(prev => ({
      ...prev,
      sizes: prev.sizes.filter(
        s => s !== size
      )
    }));
  };

  /*
   * ============================================================
   * COLORS
   * ============================================================
   */

  const handleColorChange = (color: any) => {
    setColorInput(prev => ({
      ...prev,
      value: color.hex
    }));
  };

  /*
   * Add a color only if:
   * - name exists
   * - HEX value exists
   * - image exists
   * - color doesn't already exist
   */

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

    const colorExists =
      newProduct.colors.some(
        color =>
          color.value.toLowerCase() ===
          colorInput.value.toLowerCase()
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
      sizes: [] // sizes will be managed per-color after adding
    };

    setNewProduct(prev => ({
      ...prev,
      colors: [
        ...prev.colors,
        newColor
      ]
    }));

    /*
     * Reset color form
     */

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

  const removeColor = (
    colorValue: string
  ) => {
    setNewProduct(prev => ({
      ...prev,
      colors: prev.colors.filter(
        color =>
          color.value !== colorValue
      )
    }));
  };

  const toggleColorAvailability = (
    colorValue: string
  ) => {
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
        const existing = c.sizes.find(s => s.size === size.trim());
        if (existing) {
          return {
            ...c,
            sizes: c.sizes.map(s => s.size === size.trim() ? { ...s, quantity } : s)
          };
        }
        return { ...c, sizes: [...c.sizes, { size: size.trim(), quantity }] };
      })
    }));
  };

  const removeSizeFromColor = (colorValue: string, size: string) => {
    setNewProduct(prev => ({
      ...prev,
      colors: prev.colors.map(c =>
        c.value === colorValue ? { ...c, sizes: c.sizes.filter(s => s.size !== size) } : c
      )
    }));
  };

  const updateSizeQuantity = (colorValue: string, size: string, quantity: number) => {
    setNewProduct(prev => ({
      ...prev,
      colors: prev.colors.map(c =>
        c.value === colorValue
          ? { ...c, sizes: c.sizes.map(s => s.size === size ? { ...s, quantity } : s) }
          : c
      )
    }));
  };

  /*
   * ============================================================
   * SUBMIT PRODUCT
   * ============================================================
   */

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!user) {
      toast.error(
        language === 'ar'
          ? 'يجب تسجيل الدخول أولاً'
          : 'Please log in first'
      );

      return;
    }

    /*
     * Prepare data for Joi
     */

    const preparedDataToValidate = {
      ...newProduct,

      price:
        newProduct.price === ''
          ? undefined
          : parseFloat(
              newProduct.price
            ),

      discountPercentage:
        parseFloat(
          newProduct.discountPercentage
        ) || 0,

      quantity:
        parseInt(
          newProduct.quantity
        ) || 0
    };

    /*
     * Validate
     */

    const {
      error
    } =
      productValidationSchema.validate(
        preparedDataToValidate,
        {
          abortEarly: true
        }
      );

    if (error) {
      toast.error(
        error.details[0].message
      );

      return;
    }

    setLoading(true);

    try {
      const price =
        parseFloat(
          newProduct.discountedPrice
        ) ||
        parseFloat(
          newProduct.price
        ) ||
        0;

      const platformFee =
        getPlatformFeeByPrice(
          price
        );

      const calculatedSellerPercentage =
        (1 - platformFee) * 100;

      /*
       * Product payload
       *
       * IMPORTANT:
       * colors contains:
       * {
       *   name,
       *   value,
       *   image,
       *   available
       * }
       */

      const productData = {
        title:
          newProduct.title,

        description:
          newProduct.description,

        price:
          parseFloat(
            newProduct.price
          ),

        discountPercentage:
          parseFloat(
            newProduct.discountPercentage
          ),

        discountedPrice:
          parseFloat(
            newProduct.discountedPrice
          ) ||
          parseFloat(
            newProduct.price
          ),

        category:
          newProduct.category,

        brand:
          newProduct.brand,

        images:
          newProduct.images,

        sizes:
          newProduct.sizes,

        colors:
          newProduct.colors,

        quantity:
          parseInt(
            newProduct.quantity
          ) || 0,

        isFeatured:
          newProduct.isFeatured,

        status:
          newProduct.status,

        videoUrl:
          newProduct.videoUrl.trim() || undefined,

        sellerPercentage:
          calculatedSellerPercentage
      };

      console.log(
        'Product data being sent:',
        productData
      );

      console.log(
        'Colors with images:',
        productData.colors
      );

      const response =
        await productService.createProduct(
          productData
        );

      if (response.data.success) {
        toast.success(
          language === 'ar'
            ? 'تم إنشاء المنتج بنجاح وتم إرسال طلب الاعتماد'
            : 'Product added successfully'
        );
      }

      onClose();

    } catch (error: any) {
      console.error(
        'Error creating product:',
        error
      );

      toast.error(
        error.response?.data?.message ||
          (
            language === 'ar'
              ? 'حدث خطأ أثناء إضافة المنتج'
              : 'Error adding product'
          )
      );

    } finally {
      setLoading(false);
    }
  };

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>
          {language === 'ar'
            ? 'إضافة منتج جديد'
            : 'Add New Product'}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* =====================================================
              TITLE
          ====================================================== */}

          <div>
            <Label htmlFor="title">
              {language === 'ar'
                ? 'عنوان المنتج'
                : 'Product Title'} *
            </Label>

            <Input
              id="title"
              name="title"
              value={newProduct.title}
              onChange={
                handleInputChange
              }
              placeholder={
                language === 'ar'
                  ? 'أدخل عنوان المنتج'
                  : 'Enter product title'
              }
            />
          </div>

          {/* =====================================================
              DESCRIPTION
          ====================================================== */}

          <div>
            <Label htmlFor="description">
              {language === 'ar'
                ? 'وصف المنتج'
                : 'Product Description'} *
            </Label>

            <Textarea
              id="description"
              name="description"
              value={
                newProduct.description
              }
              onChange={
                handleInputChange
              }
              placeholder={
                language === 'ar'
                  ? 'أدخل وصف المنتج'
                  : 'Enter product description'
              }
              rows={4}
            />
          </div>

          {/* =====================================================
              PRICE
          ====================================================== */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div>
              <Label htmlFor="price">
                {language === 'ar'
                  ? 'السعر'
                  : 'Price'} *
              </Label>

              <Input
                id="price"
                name="price"
                type="text"
                value={
                  newProduct.price
                }
                onChange={
                  handleNumberInputChange
                }
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="discountPercentage">
                {language === 'ar'
                  ? 'نسبة الخصم %'
                  : 'Discount Percentage %'}
              </Label>

              <Input
                id="discountPercentage"
                name="discountPercentage"
                type="text"
                value={
                  newProduct.discountPercentage
                }
                onChange={
                  handleNumberInputChange
                }
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="discountedPrice">
                {language === 'ar'
                  ? 'السعر بعد الخصم'
                  : 'Discounted Price'}
              </Label>

              <Input
                id="discountedPrice"
                name="discountedPrice"
                type="text"
                value={
                  newProduct.discountedPrice
                }
                readOnly
                className="bg-gray-100"
              />
            </div>

          </div>

          {/* =====================================================
              SELLER INFORMATION
          ====================================================== */}

          <div className="p-4 border rounded-lg bg-blue-50">

            <div className="flex items-center gap-2 mb-3">

              <Calculator className="h-5 w-5 text-blue-600" />

              <h3 className="text-lg font-semibold text-blue-800">
                {language === 'ar'
                  ? 'معلومات البائع'
                  : 'Seller Information'}
              </h3>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              <div>
                <Label htmlFor="platformFee">
                  {language === 'ar'
                    ? 'رسوم المنصة %'
                    : 'Platform Fee %'}
                </Label>

                <Input
                  id="platformFee"
                  name="platformFee"
                  type="text"
                  value={`${
  (
    platformFee * 100
  ).toFixed(1)
}% `}
                  disabled
                  className="bg-gray-200 font-bold"
                />

                <p className="text-xs text-gray-500 mt-1">
                  {language === 'ar'
                    ? 'تختلف حسب السعر بعد الخصم'
                    : 'Varies based on discounted price'}
                </p>
              </div>

              <div>
                <Label htmlFor="sellerPercentage">
                  {language === 'ar'
                    ? 'نسبة البائع %'
                    : 'Seller Percentage %'}
                </Label>

                <Input
                  id="sellerPercentage"
                  name="sellerPercentage"
                  type="text"
                  value={`${
  (
    sellerPercentage * 100
  ).toFixed(1)
}% `}
                  disabled
                  className="bg-gray-200 font-bold"
                />

                <p className="text-xs text-gray-500 mt-1">
                  {language === 'ar'
                    ? 'نسبة متغيرة حسب السعر'
                    : 'Variable percentage based on price'}
                </p>
              </div>

              <div>
                <Label htmlFor="sellerAmount">
                  {language === 'ar'
                    ? 'مبلغ البائع'
                    : 'Seller Amount'}
                </Label>

                <Input
                  id="sellerAmount"
                  name="sellerAmount"
                  type="text"
                  value={sellerAmount}
                  readOnly
                  className="bg-green-100 font-bold text-green-800"
                />

                <p className="text-xs text-gray-500 mt-1">
                  {language === 'ar'
                    ? `السعر بعد الخصم × ${
  (
    sellerPercentage * 100
  ).toFixed(1)
}% `
                    : `Discounted price × ${
  (
    sellerPercentage * 100
  ).toFixed(1)
}% `}
                </p>
              </div>

            </div>

            <div className="mt-3 p-3 bg-white rounded border">

              <p className="text-sm text-gray-600">

                {language === 'ar' ? (
                  <>
                    <strong>
                      كيفية الحساب:
                    </strong>
                    <br />

                    {getPriceRangeExplanation(
                      discountedPrice,
                      language
                    )}

                    <br />

                    {discountedPrice > 0 && (
                      <>
                        <strong>
                          الحساب:
                        </strong>{' '}
                        {discountedPrice} ×{' '}
                        {(
                          sellerPercentage * 100
                        ).toFixed(1)}
                        % ={' '}
                        <strong>
                          {sellerAmount}
                        </strong>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <strong>
                      Calculation:
                    </strong>
                    <br />

                    {getPriceRangeExplanation(
                      discountedPrice,
                      'en'
                    )}

                    <br />

                    {discountedPrice > 0 && (
                      <>
                        <strong>
                          Formula:
                        </strong>{' '}
                        {discountedPrice} ×{' '}
                        {(
                          sellerPercentage * 100
                        ).toFixed(1)}
                        % ={' '}
                        <strong>
                          {sellerAmount}
                        </strong>
                      </>
                    )}
                  </>
                )}

              </p>

            </div>

          </div>

          {/* =====================================================
              SIZES
          ====================================================== */}

          <div>

            <Label htmlFor="sizes">
              {language === 'ar'
                ? 'المقاسات'
                : 'Sizes'}
            </Label>

            <div className="flex gap-2">

              <Input
                id="sizes"
                value={sizeInput}
                onChange={e =>
                  setSizeInput(
                    e.target.value
                  )
                }
                placeholder={
                  language === 'ar'
                    ? 'أدخل مقاساً'
                    : 'Enter a size'
                }
              />

              <Button
                type="button"
                onClick={addSize}
                variant="secondary"
              >
                {language === 'ar'
                  ? 'إضافة'
                  : 'Add'}
              </Button>

            </div>

            <div className="flex flex-wrap gap-2 mt-2">

              {newProduct.sizes.map(
                (size, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-gray-100 px-3 py-1 rounded-full"
                  >

                    <span>
                      {size}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        removeSize(size)
                      }
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>

                  </div>
                )
              )}

            </div>

          </div>

          {/* =====================================================
              COLORS
          ====================================================== */}

          <div>

            <Label htmlFor="colors">
              {language === 'ar'
                ? 'الألوان'
                : 'Colors'}
            </Label>

            <div className="space-y-4">

              {/*
               * --------------------------------------------------
               * COLOR CREATION FORM
               * --------------------------------------------------
               *
               * 4 columns:
               *
               * 1. Color name
               * 2. Color value
               * 3. Color image
               * 4. Add color button
               *
               * This fixes the previous layout issue.
               */}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg">

                {/* COLOR NAME */}

                <div>

                  <Label htmlFor="colorName">
                    {language === 'ar'
                      ? 'اسم اللون'
                      : 'Color Name'} *
                  </Label>

                  <Input
                    id="colorName"
                    value={
                      colorInput.name
                    }
                    onChange={e =>
                      setColorInput(
                        prev => ({
                          ...prev,
                          name: e.target.value
                        })
                      )
                    }
                    placeholder={
                      language === 'ar'
                        ? 'أدخل اسم اللون'
                        : 'Enter color name'
                    }
                  />

                </div>

                {/* COLOR VALUE */}

                <div>

                  <Label htmlFor="colorValue">
                    {language === 'ar'
                      ? 'قيمة اللون'
                      : 'Color Value'} *
                  </Label>

                  <Popover
                    open={
                      showColorPicker
                    }
                    onOpenChange={
                      setShowColorPicker
                    }
                  >

                    <PopoverTrigger
                      asChild
                    >

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start"
                      >

                        <div
                          className="w-4 h-4 rounded mr-2 border"
                          style={{
                            backgroundColor:
                              colorInput.value
                          }}
                        />

                        {
                          colorInput.value
                        }

                      </Button>

                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-0">

                      <ChromePicker
                        color={
                          colorInput.value
                        }
                        onChange={
                          handleColorChange
                        }
                      />

                    </PopoverContent>

                  </Popover>

                </div>

                {/* COLOR IMAGE */}

                <div>

                  <Label>
                    {language === 'ar'
                      ? 'صورة اللون'
                      : 'Color Image'} *
                  </Label>

                  <div className="space-y-2">

                    {colorImage && (
                      <div className="relative w-24 h-24">

                        <img
                          src={colorImage}
                          alt={
                            colorInput.name ||
                            'Color preview'
                          }
                          className="w-24 h-24 object-cover rounded border"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setColorImage('')
                          }
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                        >
                          <X size={14} />
                        </button>

                      </div>
                    )}

                    {!colorImage && (
                      <ImageUploader
                        onUpload={url => {
                          setColorImage(
                            url
                          );

                          toast.success(
                            language === 'ar'
                              ? 'تم رفع صورة اللون بنجاح'
                              : 'Color image uploaded successfully'
                          );
                        }}
                      />
                    )}

                  </div>

                </div>

                {/* ADD COLOR BUTTON */}

                <div className="flex items-end">

                  <Button
                    type="button"
                    onClick={
                      addColor
                    }
                    className="w-full"
                  >

                    <Plus className="h-4 w-4 mr-1" />

                    {language === 'ar'
                      ? 'إضافة اللون'
                      : 'Add Color'}

                  </Button>

                </div>

              </div>

              {/* =================================================
                  ADDED COLORS — with per-color size management
              ================================================== */}

              <div className="space-y-4">
                {newProduct.colors.map((color, index) => (
                  <ColorSizeManager
                    key={`${color.value}-${index}`}
                    color={color}
                    language={language}
                    onToggleAvailability={() => toggleColorAvailability(color.value)}
                    onRemove={() => removeColor(color.value)}
                    onAddSize={(size, qty) => addSizeToColor(color.value, size, qty)}
                    onRemoveSize={(size) => removeSizeFromColor(color.value, size)}
                    onUpdateQty={(size, qty) => updateSizeQuantity(color.value, size, qty)}
                  />
                ))}
              </div>

              {/* NO COLORS */}

              {newProduct.colors.length === 0 && (
                <div className="text-center text-gray-500 py-4 border-2 border-dashed rounded-lg">
                  <Palette className="mx-auto h-8 w-8 mb-2" />
                  <p>{language === 'ar' ? 'لم تتم إضافة أي ألوان بعد' : 'No colors added yet'}</p>
                </div>
              )}

            </div>

          </div>

          {/* =====================================================
              CATEGORY
          ====================================================== */}

          <div>

            <div className="flex items-center justify-between mb-2">

              <Label htmlFor="category">
                {language === 'ar'
                  ? 'الفئة'
                  : 'Category'} *
              </Label>

            </div>

            <Select
              value={
                newProduct.category
              }
              onValueChange={value =>
                handleSelectChange(
                  'category',
                  value
                )
              }
            >

              <SelectTrigger>
                <SelectValue
                  placeholder={
                    language === 'ar'
                      ? 'اختر الفئة'
                      : 'Select category'
                  }
                />
              </SelectTrigger>

              <SelectContent>

                {categories.map(
                  (category: any) => (
                    <SelectItem
                      key={
                        category._id
                      }
                      value={
                        category._id
                      }
                    >
                      {language === 'ar'
                        ? category.name
                        : category.nameEn}
                    </SelectItem>
                  )
                )}

              </SelectContent>

            </Select>

          </div>

          {/* =====================================================
              QUANTITY
          ====================================================== */}

          <div>

            <Label htmlFor="quantity">
              {language === 'ar'
                ? 'الكمية'
                : 'Quantity'} *
            </Label>

            <Input
              id="quantity"
              name="quantity"
              type="text"
              value={
                newProduct.quantity
              }
              onChange={
                handleNumberInputChange
              }
              placeholder="0"
            />

          </div>

          {/* =====================================================
              STATUS
          ====================================================== */}

          <div>

            <Label htmlFor="status">
              {language === 'ar'
                ? 'ZZccc'
                : 'Status'}
            </Label>

            <Select
              value={
                newProduct.status
              }
              onValueChange={(
                value:
                  | 'available'
                  | 'pending'
              ) =>
                handleSelectChange(
                  'status',
                  value
                )
              }
            >

              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>

                <SelectItem value="available">
                  {language === 'ar'
                    ? 'متاح'
                    : 'Available'}
                </SelectItem>

                <SelectItem value="pending">
                  {language === 'ar'
                    ? 'قيد الانتظار'
                    : 'Pending'}
                </SelectItem>

              </SelectContent>

            </Select>

          </div>

          {/* =====================================================
              PRODUCT IMAGES
          ====================================================== */}

          {/* ── Video URL (optional) ─────────────────────────── */}
          <div>
            <Label htmlFor="videoUrl">
              {language === 'ar' ? 'رابط الفيديو (اختياري)' : 'Video URL (optional)'}
            </Label>
            <Input
              id="videoUrl"
              name="videoUrl"
              value={newProduct.videoUrl}
              onChange={(e) => setNewProduct(prev => ({ ...prev, videoUrl: e.target.value }))}
              placeholder="https://www.youtube.com/watch?v=..."
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {language === 'ar'
                ? 'ادعم روابط YouTube — سيظهر الفيديو في صفحة المنتج'
                : 'Supports YouTube links — video will appear on the product page'}
            </p>
          </div>

          <div>

            <Label htmlFor="images">
              {language === 'ar'
                ? 'الصور'
                : 'Images'} *
            </Label>

            <div className="space-y-4">

              <div className="flex flex-wrap gap-4">

                {newProduct.images.map(
                  (imageUrl, index) => (
                    <div
                      key={index}
                      className="relative"
                    >

                      <img
                        src={imageUrl}
                        alt={`Preview ${ index } `}
                        className="w-24 h-24 object-cover rounded border"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeImage(
                            index
                          )
                        }
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 -translate-y-1/2 translate-x-1/2"
                      >
                        <X size={16} />
                      </button>

                    </div>
                  )
                )}

              </div>

              <ImageUploader
                onUpload={
                  handleImageUpload
                }
              />

            </div>

          </div>

          {/* =====================================================
              CONTROL BUTTONS
          ====================================================== */}

          <div className="flex justify-end space-x-2">

            <Button
              type="button"
              variant="outline"
              onClick={
                onClose
              }
              disabled={
                loading
              }
            >
              {language === 'ar'
                ? 'إلغاء'
                : 'Cancel'}
            </Button>

            <Button
              type="submit"
              disabled={
                loading
              }
            >

              {loading ? (
                <span>
                  {language === 'ar'
                    ? 'جاري الإضافة...'
                    : 'Adding...'}
                </span>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />

                  {language === 'ar'
                    ? 'إضافة'
                    : 'Add'}
                </>
              )}

            </Button>

          </div>

        </form>
      </CardContent>
    </Card>
  );
}
