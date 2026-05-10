import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

const menuItems = [
  // COCKTAILS
  { name: 'STRAWBERRY / PASSION FRUIT MOJITO', ingredients: 'White rum, mint, lime juice, sugar, and soda water.', price: 80, category: 'cocktail', isAvailable: true, isPopular: true, imageUrl: '/images/slushy_cocktail.webp', modifiers: [{name: 'Make it a double', price: 20}, {name: 'Extra Mint', price: 5}], createdAt: serverTimestamp() },
  { name: 'MIMOSA', ingredients: 'Champagne and orange juice.', price: 120, category: 'cocktail', isAvailable: true, isPopular: false, imageUrl: '/images/slushy_cocktail.webp', modifiers: [{name: 'Extra Champagne', price: 30}], createdAt: serverTimestamp() },
  { name: 'SEX ON THE BEACH', ingredients: 'Vodka, peach schnapps, orange juice, and cranberry juice.', price: 120, category: 'cocktail', isAvailable: true, isPopular: true, imageUrl: '/images/slushy_cocktail.webp', modifiers: [{name: 'Extra Vodka', price: 20}, {name: 'Virgin (No Alcohol)', price: 0}], createdAt: serverTimestamp() },
  { name: 'PORNSTAR MARTINI', ingredients: 'Vodka, passion fruit liqueur, vanilla syrup, passion fruit puree, and a shot of Prosecco on the side.', price: 120, category: 'cocktail', isAvailable: true, isPopular: true, imageUrl: '/images/slushy_cocktail.webp', modifiers: [{name: 'Extra Prosecco', price: 25}], createdAt: serverTimestamp() },
  { name: 'PINA COLADA', ingredients: 'Coconut syrup, pineapple, tequila', price: 120, category: 'cocktail', isAvailable: true, isPopular: false, imageUrl: '/images/slushy_cocktail.webp', modifiers: [{name: 'Extra Tequila', price: 20}, {name: 'Virgin (No Alcohol)', price: 0}], createdAt: serverTimestamp() },
  { name: 'PASSION/ STRAWBERRY MARGARITA', ingredients: 'margarita syrup, tequila', price: 120, category: 'cocktail', isAvailable: true, isPopular: false, imageUrl: '/images/slushy_cocktail.webp', modifiers: [{name: 'Extra Tequila', price: 20}], createdAt: serverTimestamp() },

  // ORIGINAL
  { name: 'RED PASSION', ingredients: 'Mixed fruit, grenadine syrup', price: 50, category: 'original', isAvailable: true, isPopular: true, imageUrl: '/images/slushy_original.webp', modifiers: [{name: 'Add Shot of Vodka', price: 20}], createdAt: serverTimestamp() },
  { name: 'BLUE PILL', ingredients: 'passion, blue caro, soda', price: 50, category: 'original', isAvailable: true, isPopular: true, imageUrl: '/images/slushy_original.webp', modifiers: [{name: 'Add Shot of Tequila', price: 20}], createdAt: serverTimestamp() },
  { name: 'LEMON TEASE', ingredients: 'fresh lemon, soda, passion', price: 50, category: 'original', isAvailable: true, isPopular: false, imageUrl: '/images/slushy_original.webp', modifiers: [{name: 'Add Shot of Rum', price: 20}], createdAt: serverTimestamp() },
  { name: 'PINK ANTIDOTE', ingredients: 'Cranberry, grenadine, lemon', price: 50, category: 'original', isAvailable: true, isPopular: false, imageUrl: '/images/slushy_original.webp', modifiers: [{name: 'Add Shot of Vodka', price: 20}], createdAt: serverTimestamp() },
  { name: 'ILLUSION', ingredients: 'Grape, Vimto, s', price: 50, category: 'original', isAvailable: true, isPopular: false, imageUrl: '/images/slushy_original.webp', modifiers: [{name: 'Add Shot of Tequila', price: 20}], createdAt: serverTimestamp() },

  // FRUITY
  { name: 'MANGO', ingredients: '', price: 50, category: 'fruity', isAvailable: true, isPopular: true, imageUrl: '/images/slushy_fruity.webp', modifiers: [{name: 'Add Tapioca Pearls', price: 10}], createdAt: serverTimestamp() },
  { name: 'GRAPE', ingredients: '', price: 50, category: 'fruity', isAvailable: true, isPopular: false, imageUrl: '/images/slushy_fruity.webp', modifiers: [{name: 'Add Tapioca Pearls', price: 10}], createdAt: serverTimestamp() },
  { name: 'WATERMELON', ingredients: '', price: 50, category: 'fruity', isAvailable: true, isPopular: true, imageUrl: '/images/slushy_fruity.webp', modifiers: [{name: 'Add Mint', price: 5}], createdAt: serverTimestamp() },
  { name: 'PINEAPPLE', ingredients: '', price: 50, category: 'fruity', isAvailable: true, isPopular: false, imageUrl: '/images/slushy_fruity.webp', modifiers: [{name: 'Add Coconut Syrup', price: 5}], createdAt: serverTimestamp() },
  { name: 'PASSION', ingredients: '', price: 50, category: 'fruity', isAvailable: true, isPopular: false, imageUrl: '/images/slushy_fruity.webp', modifiers: [{name: 'Add Lime', price: 5}], createdAt: serverTimestamp() }
];

async function run() {
  console.log('Seeding menu data...');
  const colRef = collection(db, 'menuItems');
  const snap = await getDocs(colRef);
  console.log(`Found ${snap.docs.length} existing items, deleting...`);
  for (let d of snap.docs) {
    await deleteDoc(doc(db, 'menuItems', d.id));
  }
  for (let item of menuItems) {
    await addDoc(colRef, item);
  }
  console.log('Seeded menu Items successfully.');
  process.exit(0);
}

run().catch(console.error);
