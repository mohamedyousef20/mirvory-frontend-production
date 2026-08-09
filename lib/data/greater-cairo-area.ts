/**
 * Greater Cairo Area Data
 * Strict data constant for the Greater Cairo Area including 3 governorates:
 * - Cairo (القاهرة)
 * - Giza (الجيزة)
 * - Qalyubia (القليوبية)
 */

export interface GovernorateData {
  id: string;
  nameAr: string;
  nameEn: string;
  cities: CityData[];
}

export interface CityData {
  id: string;
  nameAr: string;
  nameEn: string;
}

export const GREATER_CAIRO_AREA: GovernorateData[] = [
  {
    id: 'cairo',
    nameAr: 'القاهرة',
    nameEn: 'Cairo',
    cities: [
      { id: 'cairo_downtown', nameAr: 'وسط البلد', nameEn: 'Downtown' },
      { id: 'garden_city', nameAr: 'جاردن سيتي', nameEn: 'Garden City' },
      { id: 'zamalek', nameAr: 'الزمالك', nameEn: 'Zamalek' },
      { id: 'abbasiya', nameAr: 'العباسية', nameEn: 'Abbasiya' },
      { id: 'helmiya', nameAr: 'الحلمية', nameEn: 'Helmiya' },
      { id: 'shubra', nameAr: 'شبرا', nameEn: 'Shubra' },
      { id: 'matareya', nameAr: 'المطرية', nameEn: 'Matareya' },
      { id: 'ain_shams', nameAr: 'عين شمس', nameEn: 'Ain Shams' },
      { id: 'heliopolis', nameAr: 'مصر الجديدة', nameEn: 'Heliopolis' },
      { id: 'nasr_city', nameAr: 'مدينة نصر', nameEn: 'Nasr City' },
      { id: 'new_cairo', nameAr: 'القاهرة الجديدة', nameEn: 'New Cairo' },
      { id: 'maadi', nameAr: 'المعادي', nameEn: 'Maadi' },
      { id: 'dokki', nameAr: 'الدقي', nameEn: 'Dokki' },
      { id: 'mohandessin', nameAr: 'المهندسين', nameEn: 'Mohandessin' },
      { id: 'giza_city', nameAr: 'الجيزة', nameEn: 'Giza City' },
      { id: 'faisal', nameAr: 'فيصل', nameEn: 'Faisal' },
      { id: 'haram', nameAr: 'الهرم', nameEn: 'Haram' },
      { id: '6_october', nameAr: '6 أكتوبر', nameEn: '6th of October' },
      { id: 'shubra_kheima', nameAr: 'شبرا الخيمة', nameEn: 'Shubra El-Kheima' },
      { id: 'khanka', nameAr: 'الخانكة', nameEn: 'Khanka' },
      { id: 'banha', nameAr: 'بنها', nameEn: 'Banha' },
      { id: 'qalyub', nameAr: 'قليوب', nameEn: 'Qalyub' },
      { id: 'shibin_el_qanatir', nameAr: 'شبين القناطر', nameEn: 'Shibin El-Qanatir' },
      { id: 'toukh', nameAr: 'طوخ', nameEn: 'Toukh' },
      { id: 'khusus', nameAr: 'خصوص', nameEn: 'Khusus' },
      { id: 'obour', nameAr: 'القناطر الخيرية / عبور', nameEn: 'Obour City' },
    ]
  },
  {
    id: 'giza',
    nameAr: 'الجيزة',
    nameEn: 'Giza',
    cities: [
      { id: 'dokki', nameAr: 'الدقي', nameEn: 'Dokki' },
      { id: 'mohandessin', nameAr: 'المهندسين', nameEn: 'Mohandessin' },
      { id: 'giza_city', nameAr: 'الجيزة', nameEn: 'Giza City' },
      { id: 'faisal', nameAr: 'فيصل', nameEn: 'Faisal' },
      { id: 'haram', nameAr: 'الهرم', nameEn: 'Haram' },
      { id: '6_october', nameAr: '6 أكتوبر', nameEn: '6th of October' },
      { id: 'sheikh_zayed', nameAr: 'الشيخ زايد', nameEn: 'Sheikh Zayed' },
      { id: 'hadayek_el_kobba', nameAr: 'حدائق القبة', nameEn: 'Hadayek El-Kobba' },
      { id: 'agouza', nameAr: 'أجوزة', nameEn: 'Agouza' },
      { id: 'imbaba', nameAr: 'إمبابة', nameEn: 'Imbaba' },
      { id: 'boulak', nameAr: 'بولاق', nameEn: 'Boulak' },
      { id: 'kitkat', nameAr: 'كيت كات', nameEn: 'Kitkat' },
      { id: 'warraq', nameAr: 'وراق', nameEn: 'Warraq' },
    ]
  },
  {
    id: 'qalyubia',
    nameAr: 'القليوبية',
    nameEn: 'Qalyubia',
    cities: [
      { id: 'shubra_kheima', nameAr: 'شبرا الخيمة', nameEn: 'Shubra El-Kheima' },
      { id: 'khanka', nameAr: 'الخانكة', nameEn: 'Khanka' },
      { id: 'banha', nameAr: 'بنها', nameEn: 'Banha' },
      { id: 'qalyub', nameAr: 'قليوب', nameEn: 'Qalyub' },
      { id: 'shibin_el_qanatir', nameAr: 'شبين القناطر', nameEn: 'Shibin El-Qanatir' },
      { id: 'toukh', nameAr: 'طوخ', nameEn: 'Toukh' },
      { id: 'khusus', nameAr: 'خصوص', nameEn: 'Khusus' },
      { id: 'obour', nameAr: 'القناطر الخيرية / عبور', nameEn: 'Obour City' },
      { id: 'el_qanatir', nameAr: 'القناطر', nameEn: 'El-Qanatir' },
      { id: 'kafr_shukr', nameAr: 'كفر شكر', nameEn: 'Kafr Shukr' },
      { id: 'mit_ghamr', nameAr: 'ميت غمر', nameEn: 'Mit Ghamr' },
    ]
  }
];

/**
 * Get cities by governorate ID
 */
export const getCitiesByGovernorate = (governorateId: string): CityData[] => {
  const governorate = GREATER_CAIRO_AREA.find(g => g.id === governorateId);
  return governorate?.cities || [];
};

/**
 * Get governorate by ID
 */
export const getGovernorateById = (governorateId: string): GovernorateData | undefined => {
  return GREATER_CAIRO_AREA.find(g => g.id === governorateId);
};

/**
 * Get city by ID across all governorates
 */
export const getCityById = (cityId: string): CityData | undefined => {
  for (const governorate of GREATER_CAIRO_AREA) {
    const city = governorate.cities.find(c => c.id === cityId);
    if (city) return city;
  }
  return undefined;
};
