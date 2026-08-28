interface Category {
  _id: string;
  name: string | { ar?: string; en?: string };
  nameEn?: string;
  description?: string | { ar?: string; en?: string };
  descriptionEn?: string;
  image?: string;
}

import Link from 'next/link';

interface CategoryCardProps {
  category: Category;
  className?: string;
  language?: string;
}

export const CategoryCard = ({ category, className = '', language = 'ar' }: CategoryCardProps) => {
  // Resolve name safely regardless of data shape
  const resolveName = (): string => {
    if (!category.name) return category.nameEn || '';
    // If name is an object { ar, en }
    if (typeof category.name === 'object') {
      if (language === 'en') {
        return (category.name as any).en || (category.name as any).ar || '';
      }
      return (category.name as any).ar || (category.name as any).en || '';
    }
    // If name is a string — return nameEn for English, name for Arabic
    if (language === 'en' && category.nameEn) {
      return category.nameEn;
    }
    return category.name as string;
  };

  const resolveDescription = (): string | undefined => {
    if (!category.description) return category.descriptionEn;
    if (typeof category.description === 'object') {
      if (language === 'en') {
        return (category.description as any).en || (category.description as any).ar;
      }
      return (category.description as any).ar || (category.description as any).en;
    }
    if (language === 'en' && category.descriptionEn) {
      return category.descriptionEn;
    }
    return category.description as string;
  };

  const displayName = resolveName();
  const displayDescription = resolveDescription();

  return (
    <Link href={`/categories/${category._id}`} className={`block ${className}`}>
      <div className="relative h-48 rounded-lg overflow-hidden">
        {category.image && (
          <img
            src={category.image}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{displayName}</h3>
        {displayDescription && (
          <p className="text-gray-600">{displayDescription}</p>
        )}
      </div>
    </Link>
  );
};
