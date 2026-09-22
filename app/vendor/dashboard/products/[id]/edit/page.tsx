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

interface Color {
  name: string;
  value: string;
  image: string;
  available: boolean;
}

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
    status: 'available' as 'available' | 'pending',
  });

  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);

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

        // Populate form with product data
        const prod = productResponse.data.product;
        
        // Clean colors array - remove _id field if present
        const cleanedColors = (prod.colors || []).map((color: any) => ({
          name: color.name,
          value: color.value,
          image: color.image,
          available: color.available !== false
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
          status: prod.status || 'available',
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

  const handleNewImageFiles = (files: File[]) => {
    setNewImageFiles(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setNewProduct(prev => {
      const newImages = [...prev.images];
      const removedImage = newImages[index];
      
      // Add to deleted images list
      const deletedImages = [...prev.deletedImages, removedImage];
      
      newImages.splice(index, 1);

      return {
        ...prev,
        images: newImages,
        deletedImages
      };
    });
  };

  const removeNewImageFile = (index: number) => {
    setNewImageFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
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
      available: colorInput.available
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
        colors: newProduct.colors,
        quantity: parseInt(newProduct.quantity) || 0,
        isFeatured: newProduct.isFeatured,
        status: newProduct.status,
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

                {/* New image files */}
                {newImageFiles.length > 0 && (
                  <div className="grid grid-cols-4 gap-4">
                    {newImageFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`New image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImageFile(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Image uploader */}
                <ImageUploader
                  onUpload={handleImageUpload}
                />
              </div>
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
                {/* Add color form */}
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

                {/* Colors list */}
                <div className="grid grid-cols-2 gap-4">
                  {newProduct.colors.map((color, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 border rounded-lg"
                    >
                      <div
                        className="w-8 h-8 rounded-full border"
                        style={{ backgroundColor: color.value }}
                      />
                      <span className="flex-1">{color.name}</span>
                      <button
                        type="button"
                        onClick={() => toggleColorAvailability(color.value)}
                        className={`text-sm ${
                          color.available ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        {color.available ? (ar ? 'متاح' : 'Available') : (ar ? 'غير متاح' : 'Unavailable')}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeColor(color.value, color.image)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Is Featured */}
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
