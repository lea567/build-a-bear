// ─── BEAR TYPES ───────────────────────────────────────────────────────────────
export const BEAR_TYPES = [
  { id: 'bear1', name: 'Classic Brown Bear', baseColor: '#C4956A', price: 25, image: '/assets/bears/bear1.png', description: 'The timeless teddy companion' },
  { id: 'bear2', name: 'Golden Bear',        baseColor: '#D4A853', price: 27, image: '/assets/bears/bear2.png', description: 'Warm golden fur, super soft' },
  { id: 'bear3', name: 'Dark Brown Bear',    baseColor: '#6B4226', price: 25, image: '/assets/bears/bear3.png', description: 'Rich chocolate brown fur' },
  { id: 'bear4', name: 'Cream Bear',         baseColor: '#EFE0C8', price: 28, image: '/assets/bears/bear4.png', description: 'Soft cream colored fur' },
  { id: 'bear5', name: 'Light Bear',         baseColor: '#E8D5C4', price: 26, image: '/assets/bears/bear5.png', description: 'Light and fluffy bear' },
  { id: 'bear6', name: 'Special Bear',       baseColor: '#B5835A', price: 30, image: '/assets/bears/bear6.png', description: 'Our most unique bear' },
];

// ─── TOPS ─────────────────────────────────────────────────────────────────────
export const TOPS = [
  { id: 'none_top',      name: 'No Top',             price: 0,  category: 'tops', image: null },
  { id: 'bearcause',     name: 'BearCause Tee',       price: 9,  category: 'tops', image: '/assets/clothes/tops/bearcausetshirt.png' },
  { id: 'beeyou',        name: 'BeeYOU Tee',          price: 9,  category: 'tops', image: '/assets/clothes/tops/beeyoutshirt.png' },
  { id: 'blue',          name: 'Blue Tee',            price: 9,  category: 'tops', image: '/assets/clothes/tops/bluetshirt.png' },
  { id: 'earth',         name: 'Earth Day Tee',       price: 9,  category: 'tops', image: '/assets/clothes/tops/earthtshirt.png' },
  { id: 'feelbetter',    name: 'Feel Better Tee',     price: 9,  category: 'tops', image: '/assets/clothes/tops/feelbettertshirt.png' },
  { id: 'hugs',          name: 'Hugs Tee',            price: 9,  category: 'tops', image: '/assets/clothes/tops/hugstshirt.png' },
  { id: 'ily',           name: 'ILY Tee',             price: 9,  category: 'tops', image: '/assets/clothes/tops/ilytshirt.png' },
  { id: 'legendary',     name: 'Legendary Tee',       price: 10, category: 'tops', image: '/assets/clothes/tops/legendarytshirt.png' },
  { id: 'whitetshirt',   name: 'White Classic Tee',   price: 8,  category: 'tops', image: '/assets/clothes/tops/whitetshirt.png' },
];

// ─── BOTTOMS ──────────────────────────────────────────────────────────────────
export const BOTTOMS = [
  { id: 'none_bottom',   name: 'No Bottom',           price: 0,  category: 'bottoms', image: null },
  { id: 'denimjeans',    name: 'Denim Jeans',         price: 10, category: 'bottoms', image: '/assets/clothes/bottoms/denimjeans.png' },
  { id: 'denimshorts',   name: 'Denim Shorts',        price: 9,  category: 'bottoms', image: '/assets/clothes/bottoms/denimshorts.png' },
  { id: 'denimskirt',    name: 'Denim Skirt',         price: 9,  category: 'bottoms', image: '/assets/clothes/bottoms/denimskirt.png' },
  { id: 'greyjogger',    name: 'Grey Joggers',        price: 10, category: 'bottoms', image: '/assets/clothes/bottoms/greyjogger.png' },
  { id: 'pinkshorts',    name: 'Pink Shorts',         price: 8,  category: 'bottoms', image: '/assets/clothes/bottoms/pinkshorts.png' },
  { id: 'redskirt',      name: 'Red Skirt',           price: 8,  category: 'bottoms', image: '/assets/clothes/bottoms/redskirt.png' },
  { id: 'summershorts',  name: 'Summer Shorts',       price: 8,  category: 'bottoms', image: '/assets/clothes/bottoms/summershorts.png' },
  { id: 'whiteflare',    name: 'White Flared Jeans',  price: 11, category: 'bottoms', image: '/assets/clothes/bottoms/whiteflare.png' },
];

// ─── DRESSES ──────────────────────────────────────────────────────────────────
export const DRESSES = [
  { id: 'none_dress',    name: 'No Dress',            price: 0,  category: 'dresses', image: null },
  { id: 'duckiedress',   name: 'Duckie Dress',        price: 14, category: 'dresses', image: '/assets/clothes/dresses/duckiedress.png' },
  { id: 'princessdress', name: 'Princess Dress',      price: 16, category: 'dresses', image: '/assets/clothes/dresses/princessdress.png' },
  { id: 'reddress',      name: 'Red Dress',           price: 14, category: 'dresses', image: '/assets/clothes/dresses/reddress.png' },
];

// ─── OVERALLS ─────────────────────────────────────────────────────────────────
export const OVERALLS = [
  { id: 'none_overall',  name: 'No Overall',          price: 0,  category: 'overall', image: null },
  { id: 'overalldenim',  name: 'Denim Overall',       price: 13, category: 'overall', image: '/assets/clothes/overall/overalldenim.png' },
];

// ─── HATS ─────────────────────────────────────────────────────────────────────
export const HATS = [
  { id: 'none_hat',      name: 'No Hat',              price: 0,  category: 'hats', image: null },
  { id: 'blackbeanie',   name: 'Black Beanie',        price: 7,  category: 'hats', image: '/assets/hats/blackbeanie.png' },
  { id: 'blackcap',      name: 'Black Cap',           price: 8,  category: 'hats', image: '/assets/hats/blackcap.png' },
  { id: 'bluecap',       name: 'Blue Cap',            price: 8,  category: 'hats', image: '/assets/hats/bluecap.png' },
  { id: 'champagnebow',  name: 'Champagne Bow',       price: 6,  category: 'hats', image: '/assets/hats/champagnebow.png' },
  { id: 'daisycrown',    name: 'Daisy Crown',         price: 9,  category: 'hats', image: '/assets/hats/daisycrown.png' },
  { id: 'graduationcap', name: 'Graduation Cap',      price: 10, category: 'hats', image: '/assets/hats/graduationcap.png' },
  { id: 'greenbeanie',   name: 'Green Beanie',        price: 7,  category: 'hats', image: '/assets/hats/greenbeanie.png' },
  { id: 'pinkbeanie',    name: 'Pink Beanie',         price: 7,  category: 'hats', image: '/assets/hats/pinkbeanie.png' },
  { id: 'pinkbow',       name: 'Pink Bow',            price: 6,  category: 'hats', image: '/assets/hats/pinkbow.png' },
  { id: 'princesscrown', name: 'Princess Crown',      price: 12, category: 'hats', image: '/assets/hats/princesscrown.png' },
  { id: 'redbow',        name: 'Red Bow',             price: 6,  category: 'hats', image: '/assets/hats/redbow.png' },
];

// ─── ACCESSORIES ──────────────────────────────────────────────────────────────
export const ACCESSORIES = [
  { id: 'none_acc',      name: 'No Accessory',        price: 0,  category: 'accessories', image: null },
  { id: 'blacksun',      name: 'Black Sunglasses',    price: 7,  category: 'accessories', image: '/assets/accessories/blacksunglasses.png' },
  { id: 'pinkSun',       name: 'Pink Sunglasses',     price: 7,  category: 'accessories', image: '/assets/accessories/pink.png' },
  { id: 'whitesun',      name: 'White Sunglasses',    price: 7,  category: 'accessories', image: '/assets/accessories/whitesunglasses.png' },
];

// ─── SHOES ────────────────────────────────────────────────────────────────────
export const SHOES = [
  { id: 'none_shoe',     name: 'No Shoes',            price: 0,  category: 'shoes', image: null },
  { id: 'shoes1',        name: 'Classic Sneakers',    price: 10, category: 'shoes', image: '/assets/shoes/shoes1.png' },
  { id: 'shoes2',        name: 'Sport Shoes',         price: 10, category: 'shoes', image: '/assets/shoes/shoes2.png' },
  { id: 'shoes3',        name: 'Casual Shoes',        price: 9,  category: 'shoes', image: '/assets/shoes/shoes3.png' },
  { id: 'shoes4',        name: 'Fancy Shoes',         price: 12, category: 'shoes', image: '/assets/shoes/shoes4.png' },
  { id: 'shoes5',        name: 'Boots',               price: 12, category: 'shoes', image: '/assets/shoes/shoes5.png' },
  { id: 'shoes6',        name: 'Sandals',             price: 9,  category: 'shoes', image: '/assets/shoes/shoes6.png' },
  { id: 'shoes7',        name: 'Sneakers',            price: 10, category: 'shoes', image: '/assets/shoes/shoes7.png' },
  { id: 'shoes8',        name: 'Loafers',             price: 11, category: 'shoes', image: '/assets/shoes/shoes8.png' },
  { id: 'shoes9',        name: 'High Tops',           price: 11, category: 'shoes', image: '/assets/shoes/shoes9.png' },
];

// ─── READY-MADE ───────────────────────────────────────────────────────────────
export const READY_MADE = [
  { id: 'graduation', name: 'Class of 2026',      price: 49, image: '/assets/ready-made/graduation.png',  description: 'Celebrate graduation with this special bear.', tag: 'Graduation' },
  { id: 'fox',        name: 'Foxy Friend',         price: 44, image: '/assets/ready-made/fox.png',         description: 'An adorable fox plush ready to be your best companion.', tag: 'Animal' },
  { id: 'frog',       name: 'Froggy Pal',          price: 42, image: '/assets/ready-made/frog.png',        description: 'A cute frog friend that loves to jump into your arms.', tag: 'Animal' },
  { id: 'hk1',        name: 'Hello Kitty Classic', price: 55, image: '/assets/ready-made/hellokitty1.png', description: 'The iconic Hello Kitty in classic style.', tag: 'Licensed' },
  { id: 'hk2',        name: 'Hello Kitty Special', price: 58, image: '/assets/ready-made/hellokitty2.png', description: 'Hello Kitty in a special edition outfit.', tag: 'Licensed' },
  { id: 'lapinou',    name: 'Lapinou Bunny',        price: 46, image: '/assets/ready-made/lapinou.png',    description: 'A soft and cuddly bunny perfect for all ages.', tag: 'Bunny' },
  { id: 'lion',       name: 'Leo the Lion',         price: 48, image: '/assets/ready-made/lion.png',       description: 'King of the cuddles — fierce and fluffy.', tag: 'Animal' },
  { id: 'wingspan',   name: 'Wingspan Bear',        price: 52, image: '/assets/ready-made/wingspan.png',   description: 'A unique bear ready for magical adventures.', tag: 'Special' },
];

// ─── LEGACY ───────────────────────────────────────────────────────────────────
export const CLOTHES = [{ id: 'none', name: 'No Clothes', price: 0, category: 'clothes', color: null }];

// ─── DEFAULT CONFIG ───────────────────────────────────────────────────────────
export const DEFAULT_CONFIG = {
  bearType: 'bear1', bearColor: '#C4956A',
  top: 'none_top', bottom: 'none_bottom',
  dress: 'none_dress', overall: 'none_overall',
  hat: 'none_hat', accessories: 'none_acc',
  shoes: 'none_shoe', name: 'My Bear',
};

// ─── PRICE CALCULATION ────────────────────────────────────────────────────────
export function calculatePrice(config) {
  const bear    = BEAR_TYPES.find(b => b.id === config.bearType)    || BEAR_TYPES[0];
  const top     = TOPS.find(t => t.id === config.top)               || TOPS[0];
  const bottom  = BOTTOMS.find(b => b.id === config.bottom)         || BOTTOMS[0];
  const dress   = DRESSES.find(d => d.id === config.dress)          || DRESSES[0];
  const overall = OVERALLS.find(o => o.id === config.overall)       || OVERALLS[0];
  const hat     = HATS.find(h => h.id === config.hat)               || HATS[0];
  const acc     = ACCESSORIES.find(a => a.id === config.accessories) || ACCESSORIES[0];
  const shoe    = SHOES.find(s => s.id === config.shoes)            || SHOES[0];
  return bear.price + top.price + bottom.price + dress.price + overall.price + hat.price + acc.price + shoe.price;
}
