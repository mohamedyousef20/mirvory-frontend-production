/**
 * Egypt Governorates and Cities Data
 * Comprehensive data constant for all Egyptian governorates and their major cities.
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

export const GREATER_CAIRO_AREA: GovernorateData[] = [{
  id: 'cairo',
  nameAr: 'القاهرة',
  nameEn: 'Cairo',
  cities: [
    { id: 'nasr_city', nameAr: 'مدينة نصر', nameEn: 'Nasr City' },
    { id: 'heliopolis', nameAr: 'مصر الجديدة', nameEn: 'Heliopolis' },
    { id: 'new_cairo', nameAr: 'القاهرة الجديدة', nameEn: 'New Cairo' },
    { id: 'maadi', nameAr: 'المعادي', nameEn: 'Maadi' },
    { id: 'downtown', nameAr: 'وسط البلد', nameEn: 'Downtown' },
    { id: 'zamalek', nameAr: 'الزمالك', nameEn: 'Zamalek' },
    { id: 'shubra', nameAr: 'شبرا', nameEn: 'Shubra' },
    { id: 'ain_shams', nameAr: 'عين شمس', nameEn: 'Ain Shams' },
    { id: 'helwan', nameAr: 'حلوان', nameEn: 'Helwan' },
    { id: 'zahraa_maadi', nameAr: 'زهراء المعادي', nameEn: 'Zahraa Maadi' },
    { id: 'mokattam', nameAr: 'المقطم', nameEn: 'Mokattam' },
    { id: 'manial', nameAr: 'المنيل', nameEn: 'Manial' },
    { id: 'garden_city', nameAr: 'جاردن سيتي', nameEn: 'Garden City' },
  ]
},
{
  id: 'giza',
  nameAr: 'الجيزة',
  nameEn: 'Giza',
  cities: [
    { id: 'giza_city', nameAr: 'الجيزة', nameEn: 'Giza City' },
    { id: 'dokki', nameAr: 'الدقي', nameEn: 'Dokki' },
    { id: 'mohandessin', nameAr: 'المهندسين', nameEn: 'Mohandessin' },
    { id: 'agouza', nameAr: 'العجوزة', nameEn: 'Agouza' },
    { id: 'haram', nameAr: 'الهرم', nameEn: 'Haram' },
    { id: 'faisal', nameAr: 'فيصل', nameEn: 'Faisal' },
    { id: '6_october', nameAr: '6 أكتوبر', nameEn: '6th of October' },
    { id: 'sheikh_zayed', nameAr: 'الشيخ زايد', nameEn: 'Sheikh Zayed' },
    { id: 'hadayek_ahram', nameAr: 'حدائق الأهرام', nameEn: 'Hadayek Al Ahram' },
    { id: 'imbaba', nameAr: 'إمبابة', nameEn: 'Imbaba' },
    { id: 'badrashin', nameAr: 'البدرشين', nameEn: 'Badrashin' },
  ]
},
{
  id: 'alexandria',
  nameAr: 'الإسكندرية',
  nameEn: 'Alexandria',
  cities: [
    { id: 'montaza', nameAr: 'المنتزه', nameEn: 'Montaza' },
    { id: 'east_district', nameAr: 'شرق', nameEn: 'East District' },
    { id: 'central_alex', nameAr: 'وسط الإسكندرية', nameEn: 'Central Alexandria' },
    { id: 'west_alex', nameAr: 'غرب الإسكندرية', nameEn: 'West Alexandria' },
    { id: 'amreya', nameAr: 'العמرية', nameEn: 'Amreya' },
    { id: 'smouha', nameAr: 'سموحة', nameEn: 'Smouha' },
    { id: 'miami', nameAr: 'ميامي', nameEn: 'Miami' },
    { id: 'agamy', nameAr: 'العجمي', nameEn: 'Agamy' },
    { id: 'bour_el_arab', nameAr: 'برج العرب', nameEn: 'Borg El Arab' },
  ]
},
{
  id: 'qalyubia',
  nameAr: 'القليوبية',
  nameEn: 'Qalyubia',
  cities: [
    { id: 'banha', nameAr: 'بنها', nameEn: 'Banha' },
    { id: 'shubra_kheima', nameAr: 'شبرا الخيمة', nameEn: 'Shubra El-Kheima' },
    { id: 'qalyub', nameAr: 'قليوب', nameEn: 'Qalyub' },
    { id: 'qanater', nameAr: 'القناطر الخيرية', nameEn: 'El-Qanatir El-Khayreya' },
    { id: 'obour', nameAr: 'مدينة العبور', nameEn: 'Obour City' },
    { id: 'khanka', nameAr: 'الخانكة', nameEn: 'Khanka' },
    { id: 'toukh', nameAr: 'طوخ', nameEn: 'Toukh' },
  ]
},
{
  id: 'dakahlia',
  nameAr: 'الدقهلية',
  nameEn: 'Dakahlia',
  cities: [
    { id: 'mansoura', nameAr: 'المنصورة', nameEn: 'Mansoura' },
    { id: 'talkha', nameAr: 'طلخا', nameEn: 'Talkha' },
    { id: 'mit_ghamr', nameAr: 'ميت غمر', nameEn: 'Mit Ghamr' },
    { id: 'belqas', nameAr: 'بلقاس', nameEn: 'Belqas' },
    { id: 'sinbillawin', nameAr: 'السنبلاوين', nameEn: 'Sinbillawin' },
    { id: 'shrbin', nameAr: 'شربين', nameEn: 'Shrbin' },
  ]
},
{
  id: 'sharqia',
  nameAr: 'الشرقية',
  nameEn: 'Sharqia',
  cities: [
    { id: 'zagazig', nameAr: 'الزقازيق', nameEn: 'Zagazig' },
    { id: '10_ramadan', nameAr: 'العاشر من رمضان', nameEn: '10th of Ramadan' },
    { id: 'belbeis', nameAr: 'بلبيس', nameEn: 'Belbeis' },
    { id: 'minya_qamh', nameAr: 'منيا القمح', nameEn: 'Minya El Qamh' },
    { id: 'abu_kebir', nameAr: 'أبو كبير', nameEn: 'Abu Kebir' },
    { id: 'faqus', nameAr: 'فاقوس', nameEn: 'Faqus' },
  ]
},
{
  id: 'gharbia',
  nameAr: 'الغربية',
  nameEn: 'Gharbia',
  cities: [
    { id: 'tanta', nameAr: 'طنطا', nameEn: 'Tanta' },
    { id: 'mahalla', nameAr: 'المحلة الكبرى', nameEn: 'El Mahalla El Kubra' },
    { id: 'kafr_zayat', nameAr: 'كفر الزيات', nameEn: 'Kafr El Zayat' },
    { id: 'zefta', nameAr: 'زفتى', nameEn: 'Zefta' },
    { id: 'samannoud', nameAr: 'سمنود', nameEn: 'Samannoud' },
  ]
},
{
  id: 'monufia',
  nameAr: 'المنوفية',
  nameEn: 'Monufia',
  cities: [
    { id: 'shebin_el_kom', nameAr: 'شبين الكوم', nameEn: 'Shebin El Kom' },
    { id: 'sadat_city', nameAr: 'مدينة السادات', nameEn: 'Sadat City' },
    { id: 'menouf', nameAr: 'منوف', nameEn: 'Menouf' },
    { id: 'sars_el_layan', nameAr: 'سرس الليان', nameEn: 'Sars El Layan' },
    { id: 'ashmoun', nameAr: 'أشمون', nameEn: 'Ashmoun' },
  ]
},
{
  id: 'beheira',
  nameAr: 'البحيرة',
  nameEn: 'Beheira',
  cities: [
    { id: 'damanhour', nameAr: 'دمنهور', nameEn: 'Damanhour' },
    { id: 'kafr_el_dawar', nameAr: 'كفر الدوار', nameEn: 'Kafr El Dawar' },
    { id: 'rashid', nameAr: 'رشيد', nameEn: 'Rashid' },
    { id: 'edكو', nameAr: 'إدكو', nameEn: 'Edكو' },
    { id: 'hosh_essa', nameAr: 'حوش عيسى', nameEn: 'Hosh Essa' },
  ]
},
{
  id: 'kafr_el_sheikh',
  nameAr: 'كفر الشيخ',
  nameEn: 'Kafr El Sheikh',
  cities: [
    { id: 'kafr_el_sheikh_city', nameAr: 'كفر الشيخ', nameEn: 'Kafr El Sheikh City' },
    { id: 'desouq', nameAr: 'دسوق', nameEn: 'Desouq' },
    { id: 'fouda', nameAr: 'فوه', nameEn: 'Fouh' },
    { id: 'baltim', nameAr: 'بلطيم', nameEn: 'Baltim' },
  ]
},
{
  id: 'damietta',
  nameAr: 'دمياط',
  nameEn: 'Damietta',
  cities: [
    { id: 'damietta_city', nameAr: 'دمياط', nameEn: 'Damietta City' },
    { id: 'new_damietta', nameAr: 'دمياط الجديدة', nameEn: 'New Damietta' },
    { id: 'ras_el_bar', nameAr: 'راس البر', nameEn: 'Ras El Bar' },
    { id: 'faraskour', nameAr: 'فارسكور', nameEn: 'Faraskour' },
  ]
},
{
  id: 'port_said',
  nameAr: 'بورسعيد',
  nameEn: 'Port Said',
  cities: [
    { id: 'port_said_city', nameAr: 'بورسعيد', nameEn: 'Port Said' },
    { id: 'port_fouad', nameAr: 'بورفؤاد', nameEn: 'Port Fouad' },
  ]
},
{
  id: 'ismailia',
  nameAr: 'الإسماعيلية',
  nameEn: 'Ismailia',
  cities: [
    { id: 'ismailia_city', nameAr: 'الإسماعيلية', nameEn: 'Ismailia City' },
    { id: 'fayed', nameAr: 'فايد', nameEn: 'Fayed' },
    { id: 'qantara_west', nameAr: 'القنطرة غرب', nameEn: 'El Qantara West' },
    { id: 'qantara_east', nameAr: 'القنطرة شرق', nameEn: 'El Qantara East' },
  ]
},
{
  id: 'suez',
  nameAr: 'السويس',
  nameEn: 'Suez',
  cities: [
    { id: 'suez_city', nameAr: 'السويس', nameEn: 'Suez City' },
    { id: 'arbaeen', nameAr: 'حي الأربعين', nameEn: 'Arbaeen District' },
    { id: 'attaka', nameAr: 'حي عتاقة', nameEn: 'Attaka District' },
  ]
},
{
  id: 'fayoum',
  nameAr: 'الفيوم',
  nameEn: 'Fayoum',
  cities: [
    { id: 'fayoum_city', nameAr: 'الفيوم', nameEn: 'Fayoum City' },
    { id: 'new_fayoum', nameAr: 'الفيوم الجديدة', nameEn: 'New Fayoum' },
    { id: 'sids', nameAr: 'إطسا', nameEn: 'Itsa' },
    { id: 'tamiya', nameAr: 'طامية', nameEn: 'Tamiya' },
    { id: 'youssef_seddik', nameAr: 'منشأة لطفي / يوسف الصديق', nameEn: 'Youssef Seddik' },
  ]
},
{
  id: 'beni_suef',
  nameAr: 'بني سويف',
  nameEn: 'Beni Suef',
  cities: [
    { id: 'beni_suef_city', nameAr: 'بني سويف', nameEn: 'Beni Suef City' },
    { id: 'new_beni_suef', nameAr: 'بني سويف الجديدة', nameEn: 'New Beni Suef' },
    { id: 'baha', nameAr: 'إهناسيا', nameEn: 'Ihnasia' },
    { id: 'naser', nameAr: 'ناصر', nameEn: 'Naser' },
    { id: 'fashn', nameAr: 'الفشن', nameEn: 'Fashn' },
  ]
},
{
  id: 'minya',
  nameAr: 'المنيا',
  nameEn: 'Minya',
  cities: [
    { id: 'minya_city', nameAr: 'المنيا', nameEn: 'Minya City' },
    { id: 'new_minya', nameAr: 'المنيا الجديدة', nameEn: 'New Minya' },
    { id: 'samalut', nameAr: 'سمالوط', nameEn: 'Samalut' },
    { id: 'maghagha', nameAr: 'مغاغة', nameEn: 'Maghagha' },
    { id: 'mallawi', nameAr: 'ملوي', nameEn: 'Mallawi' },
  ]
},
{
  id: 'asyut',
  nameAr: 'أسيوط',
  nameEn: 'Asyut',
  cities: [
    { id: 'asyut_city', nameAr: 'أسيوط', nameEn: 'Asyut City' },
    { id: 'new_asyut', nameAr: 'أسيوط الجديدة', nameEn: 'New Asyut' },
    { id: 'dairut', nameAr: 'ديروط', nameEn: 'Dairut' },
    { id: 'manfalut', nameAr: 'منفلوط', nameEn: 'Manfalut' },
    { id: 'abnub', nameAr: 'أبنوب', nameEn: 'Abnub' },
  ]
},
{
  id: 'sohag',
  nameAr: 'سوهاج',
  nameEn: 'Sohag',
  cities: [
    { id: 'sohag_city', nameAr: 'سوهاج', nameEn: 'Sohag City' },
    { id: 'new_sohag', nameAr: 'سوهاج الجديدة', nameEn: 'New Sohag' },
    { id: 'girga', nameAr: 'جرجا', nameEn: 'Girga' },
    { id: 'akhmim', nameAr: 'أخميم', nameEn: 'Akhmim' },
    { id: 'tahta', nameAr: 'طهطا', nameEn: 'Tahta' },
  ]
},
{
  id: 'qena',
  nameAr: 'قنا',
  nameEn: 'Qena',
  cities: [
    { id: 'qena_city', nameAr: 'قنا', nameEn: 'Qena City' },
    { id: 'new_qena', nameAr: 'قنا الجديدة', nameEn: 'New Qena' },
    { id: 'nag_hamadi', nameAr: 'نجع حمادي', nameEn: 'Nag Hammadi' },
    { id: 'qus', nameAr: 'قوص', nameEn: 'Qus' },
    { id: 'armant', nameAr: 'دشنا', nameEn: 'Deshna' },
  ]
},
{
  id: 'luxor',
  nameAr: 'الأقصر',
  nameEn: 'Luxor',
  cities: [
    { id: 'luxor_city', nameAr: 'الأقصر', nameEn: 'Luxor City' },
    { id: 'new_luxor', nameAr: 'الأقصر الجديدة', nameEn: 'New Luxor' },
    { id: 'esna', nameAr: 'إسنا', nameEn: 'Esna' },
    { id: 'armant_city', nameAr: 'أرمنت', nameEn: 'Armant' },
  ]
},
{
  id: 'aswan',
  nameAr: 'أسوان',
  nameEn: 'Aswan',
  cities: [
    { id: 'aswan_city', nameAr: 'أسوان', nameEn: 'Aswan City' },
    { id: 'new_aswan', nameAr: 'أسوان الجديدة', nameEn: 'New Aswan' },
    { id: 'kom_ombo', nameAr: 'كوم أمبو', nameEn: 'Kom Ombo' },
    { id: ' Edfu', nameAr: 'إدفو', nameEn: 'Edfu' },
    { id: 'abu_simbel', nameAr: 'أبو سمبل', nameEn: 'Abu Simbel' },
  ]
},
{
  id: 'red_sea',
  nameAr: 'البحر الأحمر',
  nameEn: 'Red Sea',
  cities: [
    { id: 'hurghada', nameAr: 'الغردقة', nameEn: 'Hurghada' },
    { id: 'safaga', nameAr: 'سفاجا', nameEn: 'Safaga' },
    { id: 'qoseir', nameAr: 'القصير', nameEn: 'Qoseir' },
    { id: 'marsa_alam', nameAr: 'مرسى علم', nameEn: 'Marsa Alam' },
    { id: 'ras_ghareb', nameAr: 'راس غارب', nameEn: 'Ras Ghareb' },
  ]
},
{
  id: 'new_valley',
  nameAr: 'الوادي الجديد',
  nameEn: 'New Valley',
  cities: [
    { id: 'kharga', nameAr: 'الخارجة', nameEn: 'Kharga' },
    { id: 'dakhla', nameAr: 'الداخلة', nameEn: 'Dakhla' },
    { id: 'farafra', nameAr: 'الفرافرة', nameEn: 'Farafra' },
  ]
},
{
  id: 'matrouh',
  nameAr: 'مطروح',
  nameEn: 'Matrouh',
  cities: [
    { id: 'marsa_matrouh', nameAr: 'مرسى مطروح', nameEn: 'Marsa Matrouh' },
    { id: 'el_alamein', nameAr: 'العلمين', nameEn: 'El Alamein' },
    { id: 'el_hammam', nameAr: 'الحمام', nameEn: 'El Hammam' },
    { id: 'siwa', nameAr: 'سيوة', nameEn: 'Siwa' },
  ]
},
{
  id: 'north_sinai',
  nameAr: 'شمال سيناء',
  nameEn: 'North Sinai',
  cities: [
    { id: 'arish', nameAr: 'العريش', nameEn: 'Arish' },
    { id: 'sheikh_zuweid', nameAr: 'الشيخ زويد', nameEn: 'Sheikh Zuweid' },
    { id: 'rafah', nameAr: 'رفح', nameEn: 'Rafah' },
  ]
},
{
  id: 'south_sinai',
  nameAr: 'جنوب سيناء',
  nameEn: 'South Sinai',
  cities: [
    { id: 'sharm_el_sheikh', nameAr: 'شرم الشيخ', nameEn: 'Sharm El Sheikh' },
    { id: 'dahab', nameAr: 'دهب', nameEn: 'Dahab' },
    { id: 'nuweiba', nameAr: 'نويبع', nameEn: 'Nuweiba' },
    { id: 'st_catherine', nameAr: 'سنت كاترين', nameEn: 'St. Catherine' },
    { id: 'tor_sinai', nameAr: 'الطور', nameEn: 'El Tor' },
  ]
}
];


export const getCitiesByGovernorate = (
  governorateId: string
): CityData[] => {
  const governorate = GREATER_CAIRO_AREA.find(
    (g) => g.id === governorateId
  );

  return governorate?.cities ?? [];
};

/**
 * Get governorate by ID
 */
export const getGovernorateById = (
  governorateId: string
): GovernorateData | undefined => {
  return GREATER_CAIRO_AREA.find(
    (g) => g.id === governorateId
  );
};

/**
 * Get city by ID across all governorates
 */
export const getCityById = (
  cityId: string
): CityData | undefined => {
  for (const governorate of GREATER_CAIRO_AREA) {
    const city = governorate.cities.find(
      (c) => c.id === cityId
    );

    if (city) return city;
  }

  return undefined;
}