import React from 'react';
import {
  Tag, Car, Smartphone, Home, Sofa, Shirt, ShoppingBag,
  Briefcase, Gamepad2, Music, Baby, BookOpen, Bike,
  Wrench, Dumbbell, PawPrint, Gem, Palette, Package,
  Cog, Building2, Store, Leaf, Heart
} from 'lucide-react';

export const categories = [
  "Antiques and collectibles",
  "Appliances",
  "Arts & crafts",
  "Baby & children",
  "Bags & luggage",
  "Bicycles",
  "Books, films & music",
  "Car parts",
  "Electronics & computers",
  "Mobile phones & Tablets",
  "Furniture",
  "Garage sale",
  "Garden",
  "Health & beauty",
  "Household",
  "Jewellery and accessories",
  "Men's clothing & shoes",
  "Women's clothing & shoes",
  "Miscellaneous",
  "Musical Instruments",
  "Pet supplies",
  "Property for sale",
  "Property to rent",
  "Sport and outdoors",
  "Tools",
  "Video Games",
  "Vehicles",
  "Services & Jobs",
];

// ✅ Category-wise icon mapping
export const categoryIcons = {
  "Antiques and collectibles": Gem,
  "Appliances": Cog,
  "Arts & crafts": Palette,
  "Baby & children": Baby,
  "Bags & luggage": ShoppingBag,
  "Bicycles": Bike,
  "Books, films & music": BookOpen,
  "Car parts": Wrench,
  "Electronics & computers": Smartphone,
  "Mobile phones & Tablets": Smartphone,
  "Furniture": Sofa,
  "Garage sale": Store,
  "Garden": Leaf,
  "Health & beauty": Heart,
  "Household": Home,
  "Jewellery and accessories": Gem,
  "Men's clothing & shoes": Shirt,
  "Women's clothing & shoes": Shirt,
  "Miscellaneous": Package,
  "Musical Instruments": Music,
  "Pet supplies": PawPrint,
  "Property for sale": Building2,
  "Property to rent": Home,
  "Sport and outdoors": Dumbbell,
  "Tools": Wrench,
  "Video Games": Gamepad2,
  "Vehicles": Car,
  "Services & Jobs": Briefcase,
};

// ✅ Icon component helper
export const getCategoryIcon = (category, className = 'w-4 h-4') => {
  const IconComponent = categoryIcons[category] || Tag;
  return <IconComponent className={className} />;
};
