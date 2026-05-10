import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function seed() {
  console.log("Adding mock order...");
  await addDoc(collection(db, 'orders'), {
    orderNumber: 1234,
    customerId: "dummy_id",
    customerName: "Jane Doe",
    customerPhone: "+23351234567",
    orderType: "walk-in",
    status: "pending",
    totalAmount: 240,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [
      {
        menuItemId: "o1",
        itemName: "RED PASSION",
        quantity: 2,
        unitPrice: 50,
        subtotal: 100
      },
      {
        menuItemId: "o2",
        itemName: "MIMOSA",
        quantity: 1,
        unitPrice: 120,
        subtotal: 120
      }
    ]
  });
  console.log("Mock order added.");
  process.exit(0);
}
seed().catch(console.error);
