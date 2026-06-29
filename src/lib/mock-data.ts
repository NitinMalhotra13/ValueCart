
import { type Product } from './types';
import { PlaceHolderImages } from './placeholder-images';

const productInfo: { name: string; category: string, specifications: string }[] = [
  // Laptops (10)
  { name: 'QuantumBook Pro X', category: 'Laptops', specifications: 'M3 Max Chip, 16-core GPU, 1TB SSD, 32GB RAM, 16-inch Liquid Retina XDR' },
  { name: 'Zenith Laptop 15', category: 'Laptops', specifications: 'Intel Core i9-13900H, NVIDIA RTX 4080, 32GB DDR5, 2TB NVMe SSD, 15.6" 240Hz QHD' },
  { name: 'StellarPad Air', category: 'Laptops', specifications: 'AMD Ryzen 7 7840U, 16GB LPDDR5, 1TB SSD, 13.3" 2.8K OLED Display, 18-hour battery' },
  { name: 'NovaBook Ultra', category: 'Laptops', specifications: 'Intel Core i7-1360P, 16GB RAM, 512GB SSD, 15-inch Full HD, Windows 11 Home' },
  { name: 'Orion-17 Gaming Laptop', category: 'Laptops', specifications: 'AMD Ryzen 9 7945HX, RTX 4090, 64GB DDR5, 4TB RAID 0 SSD, 17" QHD Mini-LED' },
  { name: 'ApexBook Slim', category: 'Laptops', specifications: 'Intel Evo Core i7, 16GB RAM, 1TB SSD, 14-inch IPS Touchscreen, 2-in-1 Stylus support' },
  { name: 'CosmoWorkstation 16', category: 'Laptops', specifications: 'Intel Core i9-13980HX, NVIDIA RTX 5000 Ada, 64GB ECC RAM, 2TB SSD, 16" 4K Display' },
  { name: 'AuraNote Flex', category: 'Laptops', specifications: 'Qualcomm Snapdragon X Elite, 32GB RAM, 1TB SSD, 13.5" 3K OLED, 5G Connectivity' },
  { name: 'GalacticBook 14', category: 'Laptops', specifications: 'AMD Ryzen 5 7640HS, 16GB RAM, 512GB SSD, 14-inch 120Hz IPS, Backlit Keyboard' },
  { name: 'Pioneer ProBook', category: 'Laptops', specifications: 'Intel Core i5-1335U, 8GB RAM, 256GB SSD, MIL-STD-810H, 14" FHD Outdoor Display' },

  // Smartphones (5)
  { name: 'Galaxy S24 Ultra', category: 'Smartphones', specifications: 'Snapdragon 8 Gen 3 for Galaxy, 12GB RAM, 200MP Camera, 6.8" Dynamic AMOLED 2X, S Pen' },
  { name: 'iPhone 15 Pro Max', category: 'Smartphones', specifications: 'A17 Pro Chip, 8GB RAM, Titanium Frame, 48MP Pro Camera System, 6.7" Super Retina XDR' },
  { name: 'Pixel 8 Pro', category: 'Smartphones', specifications: 'Google Tensor G3, 12GB RAM, 50MP Main Camera, AI Features, 6.7" Super Actua Display' },
  { name: 'OnePlus 12', category: 'Smartphones', specifications: 'Snapdragon 8 Gen 3, 16GB RAM, Hasselblad Camera, 6.82" 2K 120Hz ProXDR Display, 100W Charging' },
  { name: 'ZenFone 11 Ultra', category: 'Smartphones', specifications: 'Snapdragon 8 Gen 3, 16GB RAM, 6-Axis Hybrid Gimbal Stabilizer, 6.78" 144Hz AMOLED' },
  
  // Mobile Phone Accessories (5)
  { name: 'Anker PowerCore 20K', category: 'Mobile Phone Accessories', specifications: '20000mAh capacity, USB-C Power Delivery, High-Speed Charging for Phones and Laptops' },
  { name: 'Spigen Tough Armor Case', category: 'Mobile Phone Accessories', specifications: 'Dual-layer protection, Air Cushion Technology, Kickstand, Fits iPhone 15 Pro' },
  { name: 'iOttie Easy One Touch 5 Car Mount', category: 'Mobile Phone Accessories', specifications: 'Universal car mount, One-touch mechanism, Telescopic arm, Dashboard & Windshield' },
  { name: 'Samsung Galaxy Buds 2 Pro', category: 'Mobile Phone Accessories', specifications: '24-bit Hi-Fi Audio, Intelligent ANC, 360 Audio, IPX7 Water Resistant' },
  { name: 'Apple MagSafe Charger', category: 'Mobile Phone Accessories', specifications: '15W wireless charging, Magnetic alignment, Compatible with iPhone 12 and later' },

  // Headphones (5)
  { name: 'Sony WH-1000XM5', category: 'Headphones', specifications: 'Industry Leading Noise Cancellation, 30-hour battery, Hi-Res Audio, Multipoint connection' },
  { name: 'Bose QuietComfort Ultra', category: 'Headphones', specifications: 'Immersive Audio, World-class noise cancellation, CustomTune technology, 24-hour battery' },
  { name: 'Sennheiser Momentum 4', category: 'Headphones', specifications: 'Signature Sound, Adaptive Noise Cancellation, 60-hour battery life, Customizable EQ' },
  { name: 'Apple AirPods Max', category: 'Headphones', specifications: 'High-fidelity audio, Spatial Audio, Active Noise Cancellation, Knit-mesh canopy, 20-hour battery' },
  { name: 'Anker Soundcore Space Q45', category: 'Headphones', specifications: 'Upgraded noise cancelling, Hi-Res Wireless Audio, 50-hour playtime, AI-enhanced calls' },
  
  // Smartwatches (5)
  { name: 'Apple Watch Ultra 2', category: 'Smartwatches', specifications: 'Titanium case, S9 SiP, Double Tap gesture, Precision Finding, 36-hour battery, Water resistant 100m' },
  { name: 'Samsung Galaxy Watch 6', category: 'Smartwatches', specifications: 'Sapphire Crystal, Rotating Bezel, Sleep Coaching, Body Composition, Wear OS, ECG' },
  { name: 'Google Pixel Watch 2', category: 'Smartwatches', specifications: 'Fitbit integration, cEDA sensor for stress, ECG, 24-hour battery with AOD, Wear OS 4' },
  { name: 'Garmin Venu 3', category: 'Smartwatches', specifications: 'AMOLED display, 14-day battery, GPS, Sleep Coach, Advanced fitness metrics, Garmin Pay' },
  { name: 'Fitbit Sense 2', category: 'Smartwatches', specifications: 'Stress tracking, Skin temperature sensor, ECG app, Built-in GPS, 6+ day battery' },

  // Cameras (5)
  { name: 'Sony Alpha a7 IV', category: 'Cameras', specifications: '33MP Full-Frame Exmor R CMOS Sensor, 4K 60p Video, Real-time Eye AF, 5-axis stabilization' },
  { name: 'Canon EOS R6 Mark II', category: 'Cameras', specifications: '24.2MP Full-Frame CMOS Sensor, 4K60 10-Bit Internal Video, Dual Pixel CMOS AF II' },
  { name: 'Nikon Z8', category: 'Cameras', specifications: '45.7MP FX-Format Stacked CMOS Sensor, 8.3K 60p N-RAW, 4K 120p Video, 493-Point AF' },
  { name: 'Fujifilm X-T5', category: 'Cameras', specifications: '40MP APS-C X-Trans CMOS 5 HR BSI Sensor, 6.2K 30p Video, 7-stop in-body stabilization' },
  { name: 'GoPro HERO12 Black', category: 'Cameras', specifications: '5.3K60/4K120 Video, HyperSmooth 6.0 Image Stabilization, 8:7 Aspect Ratio, HDR Video' },

  // Groceries (5)
  { name: 'Organic Avocados (Pack of 4)', category: 'Groceries', specifications: 'Hass avocados, Certified Organic, Ready to eat' },
  { name: 'Himalayan Pink Salt (500g)', category: 'Groceries', specifications: 'Coarse grain, Rich in minerals, Sourced from the Himalayas' },
  { name: 'Extra Virgin Olive Oil (1L)', category: 'Groceries', specifications: 'Cold-pressed, Unfiltered, Product of Italy' },
  { name: 'Almond Flour (1kg)', category: 'Groceries', specifications: 'Finely sifted, Gluten-free, Keto-friendly, High in protein' },
  { name: 'Quinoa (500g)', category: 'Groceries', specifications: 'Organic, Pre-washed, Complete protein, Cooks in 15 minutes' },

  // Ethnic Wear (5)
  { name: 'Silk Blend Saree', category: 'Ethnic Wear', specifications: 'Banarasi style, Zari work border, Includes unstitched blouse piece' },
  { name: 'Men\'s Cotton Kurta', category: 'Ethnic Wear', specifications: 'Long sleeve, Mandarin collar, Side slits, 100% breathable cotton' },
  { name: 'Embroidered Anarkali Gown', category: 'Ethnic Wear', specifications: 'Georgette fabric, Floor length, Thread and sequin embroidery' },
  { name: 'Nehru Jacket', category: 'Ethnic Wear', specifications: 'Brocade fabric, Sleeveless, Mandarin collar, Can be worn over a kurta or shirt' },
  { name: 'Chikankari Palazzo Suit', category: 'Ethnic Wear', specifications: 'Hand-embroidered Lucknowi Chikankari, Cotton fabric, Three-piece set' },
  
  // T-shirts (5)
  { name: 'Classic Crew Neck T-shirt', category: 'T-shirts', specifications: '100% Pima Cotton, Regular fit, Tagless neck label for comfort' },
  { name: 'V-Neck Graphic Tee', category: 'T-shirts', specifications: 'Soft cotton-poly blend, Vintage-inspired graphic print, Slim fit' },
  { name: 'Striped Pocket T-shirt', category: 'T-shirts', specifications: '100% Organic Cotton, Yarn-dyed stripes, Chest pocket detail' },
  { name: 'Henley Long Sleeve T-shirt', category: 'T-shirts', specifications: 'Waffle-knit thermal fabric, Three-button placket, Ribbed cuffs' },
  { name: 'Oversized Drop Shoulder T-shirt', category: 'T-shirts', specifications: 'Heavyweight cotton jersey, Boxy fit, Dropped shoulders for a relaxed look' },

  // Hoodies (5)
  { name: 'Fleece Lined Pullover Hoodie', category: 'Hoodies', specifications: 'Cotton-poly fleece, Kangaroo pocket, Double-lined hood with drawstring' },
  { name: 'Tech Fleece Zip-Up Hoodie', category: 'Hoodies', specifications: 'Lightweight tech fleece fabric, Taped seams, Articulated design for mobility' },
  { name: 'Sherpa Lined Hoodie', category: 'Hoodies', specifications: 'Ultra-soft sherpa lining, Full zip front, Ribbed cuffs and hem for a snug fit' },
  { name: 'Graphic Print Hoodie', category: 'Hoodies', specifications: 'Midweight fleece, Bold back graphic, Screen-printed chest logo' },
  { name: 'Color Block Hoodie', category: 'Hoodies', specifications: '80% cotton, 20% polyester, Panelled color-block design, Soft brushed interior' },

  // Jewellery (5)
  { name: 'Sterling Silver Hoop Earrings', category: 'Jewellery', specifications: '925 Sterling Silver, 30mm diameter, Polished finish, Secure clasp' },
  { name: 'Gold-Plated Pendant Necklace', category: 'Jewellery', specifications: '18k gold plating over brass, Dainty chain, Cubic zirconia centerpiece' },
  { name: 'Beaded Friendship Bracelet', category: 'Jewellery', specifications: 'Handmade with glass beads, Adjustable slide closure, Set of two' },
  { name: 'Oxidised Silver Jhumka Earrings', category: 'Jewellery', specifications: 'German silver, Traditional Indian bell design, Lightweight for comfort' },
  { name: 'Minimalist Signet Ring', category: 'Jewellery', specifications: 'Stainless steel, Brushed finish, Available in sizes 6-12' },
  
  // Decorative Items (5)
  { name: 'Macrame Wall Hanging', category: 'Decorative Items', specifications: 'Hand-woven cotton rope, Wooden dowel, Bohemian style, 24 x 36 inches' },
  { name: 'Ceramic Planter Pot Set', category: 'Decorative Items', specifications: 'Set of three pots, Matte finish, Includes drainage hole and plug' },
  { name: 'Scented Soy Wax Candle', category: 'Decorative Items', specifications: 'Lavender and chamomile scent, 40-hour burn time, Glass jar with wooden lid' },
  { name: 'Floating Wall Shelves', category: 'Decorative Items', specifications: 'Set of two, Paulownia wood, Rustic finish, Includes mounting hardware' },
  { name: 'Abstract Canvas Art Print', category: 'Decorative Items', specifications: 'Gallery-wrapped canvas, 1.5-inch deep frame, Ready to hang, 30 x 40 inches' },

  // Shirts (5)
  { name: 'Linen Button-Down Shirt', category: 'Shirts', specifications: '100% Linen, Breathable fabric, Regular fit, Mother-of-pearl buttons' },
  { name: 'Flannel Plaid Shirt', category: 'Shirts', specifications: 'Brushed cotton flannel, Classic plaid pattern, Two chest pockets' },
  { name: 'Denim Workshirt', category: 'Shirts', specifications: 'Midweight denim, Reinforced stitching, Snap buttons, Western-style yokes' },
  { name: 'Oxford Cloth Button-Down', category: 'Shirts', specifications: '100% Oxford cotton, Button-down collar, Chest pocket, A timeless classic' },
  { name: 'Short-Sleeve Camp Collar Shirt', category: 'Shirts', specifications: 'Lightweight rayon, Tropical print, Straight hem with side vents' },

  // Dresses (5)
  { name: 'Floral Wrap Maxi Dress', category: 'Dresses', specifications: 'Lightweight woven fabric, V-neckline, Tie-waist detail, Ruffled hem' },
  { name: 'Ribbed Knit Bodycon Dress', category: 'Dresses', specifications: 'Stretchy ribbed knit, Midi length, Sleeveless, Figure-hugging fit' },
  { name: 'Tiered Cotton Sundress', category: 'Dresses', specifications: '100% cotton poplin, Square neckline, Smocked back, Tiered skirt' },
  { name: 'Puff Sleeve Mini Dress', category: 'Dresses', specifications: 'Jacquard fabric, Sweetheart neckline, Voluminous puff sleeves, A-line silhouette' },
  { name:'Shirt Dress with Belt', category: 'Dresses', specifications: 'Crisp cotton, Button-front closure, Detachable waist belt, Knee-length' },
  
  // Bottoms (5)
  { name: 'High-Waisted Straight Leg Jeans', category: 'Bottoms', specifications: '99% cotton, 1% elastane, Classic five-pocket styling, Rigid denim' },
  { name: 'Wide-Leg Linen Trousers', category: 'Bottoms', specifications: 'Linen-viscose blend, Pleat-front detail, Elasticated back waistband' },
  { name: 'Cargo Jogger Pants', category: 'Bottoms', specifications: 'Stretch twill fabric, Multiple cargo pockets, Elasticated cuffs and waistband' },
  { name: 'A-Line Denim Skirt', category: 'Bottoms', specifications: 'Button-front, Mini length, Faded wash, Slight A-line shape' },
  { name: 'Performance Leggings', category: 'Bottoms', specifications: 'Moisture-wicking fabric, High-rise waistband, Side pocket for phone' },

  // Tops (4)
  { name: 'Satin Cami Top', category: 'Tops', specifications: 'Lustrous satin fabric, V-neckline, Adjustable spaghetti straps' },
  { name: 'Lace Trim Blouse', category: 'Tops', specifications: 'Sheer chiffon with lace insets, Long blouson sleeves, Button-front' },
  { name: 'Square Neck Bodysuit', category: 'Tops', specifications: 'Double-layered stretch fabric, Thong back with snap closure' },
  { name: 'Chunky Knit Sweater', category: 'Tops', specifications: 'Wool-blend yarn, Cable-knit pattern, Ribbed mock neck, cuffs, and hem' },

   // Keyboards (4)
   { name: 'MX Keys S', category: 'Keyboards', specifications: 'A premium, low-profile keyboard with smart backlighting and the ability to connect to multiple devices seamlessly.' },
   { name: 'Keychron Q1 Pro', category: 'Keyboards', specifications: 'A fully customizable mechanical keyboard with a gasket mount design, hot-swappable switches, and QMK/VIA support.' },
   { name: 'Razer BlackWidow V4 Pro', category: 'Keyboards', specifications: 'A top-tier gaming keyboard with customizable Chroma RGB lighting, dedicated macro keys, and a multi-function digital dial.' },
   { name: 'Apple Magic Keyboard', category: 'Keyboards', specifications: 'The quintessential minimalist keyboard, designed to perfectly complement the Apple ecosystem with its sleek aluminum build.' },
 
   // TVs (5)
   { name: 'Samsung S95D OLED', category: 'TVs', specifications: 'A flagship 4K QD-OLED TV with a new anti-glare screen, offering vibrant colors and deep blacks.' },
   { name: 'LG G4 OLED', category: 'TVs', specifications: 'A premium OLED TV featuring Micro Lens Array (MLA) technology for exceptional brightness and a new Alpha 11 processor.' },
   { name: 'Sony Bravia 9', category: 'TVs', specifications: 'A high-end Mini LED TV that delivers outstanding brightness and contrast control, rivaling OLED performance.' },
   { name: 'TCL QM8 (2024)', category: 'TVs', specifications: 'A feature-packed Mini LED TV that offers excellent performance for its price, with great brightness and contrast.' },
   { name: 'Hisense U8N', category: 'TVs', specifications: 'A bright and colorful Mini LED TV that provides great value, with strong performance in both dark and bright rooms.' },
];

// Simple pseudo-random number generator with a seed
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const generatePrice = (min: number, max: number, seed: number) => {
  const random = mulberry32(seed);
  const randomPrice = random() * (max - min) + min;
  const finalPrice = Math.min(randomPrice, 99999);
  return Math.floor(finalPrice / 100) * 100 + 49;
};

const categoryToHintMap: { [key: string]: string[] } = {
  'Laptops': ['laptop', 'gaming laptop'],
  'Smartphones': ['smartphone'],
  'Mobile Phone Accessories': ['power bank', 'phone case', 'car mount', 'earbuds', 'wireless charger'],
  'Headphones': ['headphones', 'studio headphones'],
  'Smartwatches': ['smartwatch'],
  'Cameras': ['camera', 'action camera'],
  'Groceries': ['avocados', 'pink salt', 'olive oil', 'almond flour', 'quinoa'],
  'Ethnic Wear': ['ethnic saree', 'men kurta', 'anarkali gown', 'nehru jacket', 'chikankari suit'],
  'T-shirts': ['t-shirt', 'graphic tee', 'striped shirt', 'henley shirt', 'oversized shirt'],
  'Hoodies': ['pullover hoodie', 'zip hoodie', 'sherpa hoodie', 'graphic hoodie', 'colorblock hoodie'],
  'Jewellery': ['hoop earrings', 'pendant necklace', 'friendship bracelet', 'jhumka earrings', 'signet ring'],
  'Decorative Items': ['macrame decor', 'planter pots', 'scented candle', 'wall shelves', 'canvas art'],
  'Shirts': ['linen shirt', 'flannel shirt', 'denim shirt', 'oxford shirt', 'camp shirt'],
  'Dresses': ['floral dress', 'knit dress', 'sundress', 'mini dress', 'shirt dress'],
  'Bottoms': ['jeans', 'trousers', 'joggers', 'denim skirt', 'leggings'],
  'Tops': ['satin top', 'blouse', 'bodysuit', 'sweater'],
  'Running Shoes': ['running shoes'],
  'Backpacks': ['backpack'],
  'Keyboards': ['keyboard', 'mechanical keyboard', 'gaming keyboard'],
  'Gaming Mice': ['gaming mouse'],
  'TVs': ['tv'],
  'Coffee Machines': ['espresso machine', 'coffee machine', 'capsule coffee'],
};


const getImageForCategory = (category: string, usedImageIds: Set<string>): typeof PlaceHolderImages[0] => {
    const possibleHints = categoryToHintMap[category] || [];
    for (const hint of possibleHints) {
        const image = PlaceHolderImages.find(img => img.imageHint.includes(hint) && !usedImageIds.has(img.id));
        if (image) {
            usedImageIds.add(image.id);
            return image;
        }
    }
    // Fallback to any unused image if no specific hint found
    const fallbackImage = PlaceHolderImages.find(img => !usedImageIds.has(img.id));
    if (fallbackImage) {
      usedImageIds.add(fallbackImage.id);
      return fallbackImage;
    }
    // If all images are used, just return a random one (should not happen with enough images)
    return PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)];
};


export const products: Product[] = (() => {
  const usedImageIds = new Set<string>();
  
  return productInfo.map((details, index) => {
    const image = getImageForCategory(details.category, usedImageIds);
    
    let minPrice = 1000;
    let maxPrice = 99999;

    const categoryPrices: { [key: string]: { min: number; max: number } } = {
      'Laptops': { min: 25000, max: 95000 },
      'Smartphones': { min: 8000, max: 85000 },
      'Mobile Phone Accessories': { min: 500, max: 8000 },
      'Headphones': { min: 1000, max: 30000 },
      'Smartwatches': { min: 2500, max: 45000 },
      'Cameras': { min: 12000, max: 95000 },
      'Groceries': { min: 100, max: 1500 },
      'Ethnic Wear': { min: 1500, max: 15000 },
      'T-shirts': { min: 400, max: 2500 },
      'Hoodies': { min: 1200, max: 5000 },
      'Jewellery': { min: 500, max: 10000 },
      'Decorative Items': { min: 300, max: 4000 },
      'Shirts': { min: 800, max: 4000 },
      'Dresses': { min: 1200, max: 8000 },
      'Bottoms': { min: 900, max: 4500 },
      'Tops': { min: 600, max: 3500 },
      'Running Shoes': { min: 2000, max: 12000 },
      'Backpacks': { min: 1000, max: 10000 },
      'Keyboards': { min: 1500, max: 12000 },
      'Gaming Mice': { min: 1500, max: 12000 },
      'TVs': { min: 15000, max: 90000 },
      'Coffee Machines': { min: 1500, max: 50000 },
    };

    if (categoryPrices[details.category]) {
      minPrice = categoryPrices[details.category].min;
      maxPrice = categoryPrices[details.category].max;
    }

    const seed = index + 1;
    const ratingSeed = seed + productInfo.length;
    const randomForRating = mulberry32(ratingSeed);

    return {
      id: image.id,
      name: details.name,
      price: generatePrice(minPrice, maxPrice, seed),
      rating: parseFloat((randomForRating() * (5 - 3.5) + 3.5).toFixed(1)),
      imageUrl: image.imageUrl,
      imageHint: image.imageHint,
      description: image.description,
      category: details.category,
      specifications: details.specifications,
    };
  });
})();
