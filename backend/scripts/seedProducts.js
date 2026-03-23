require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Product = require('../src/models/Product');
const connectDB = require('../src/config/db');

const products = [
  { 
    name: 'Montre Premium Connectée', 
    description: 'Montre connectée premium avec suivi cardiaque, GPS, paiement sans contact et écran AMOLED haute résolution.',
    price: 35000, 
    category: 'Électronique', 
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=400&q=80'],
    features: ['Résistance à l\'eau IPX68', 'Batterie 14 jours', 'Écran AMOLED 1.4"', 'Compatible iOS & Android'],
    stock: 15
  },
  { 
    name: 'Lunettes de soleil Classic', 
    description: 'Lunettes de soleil élégantes avec protection UV400 et verres polarisés.',
    price: 12500, 
    category: 'Accessoires', 
    imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=400&q=80'],
    features: ['Protection UV400', 'Verres Polarisés', 'Monture légère', 'Étui inclus'],
    stock: 20
  },
  { 
    name: 'Sac à main Élégant', 
    description: 'Sac à main en cuir véritable, design intemporel avec multiples compartiments.',
    price: 28000, 
    category: 'Mode', 
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=400&q=80'],
    features: ['Cuir véritable', 'Grande capacité', 'Bandoulière amovible', 'Fermeture sécurisée'],
    stock: 8
  }
];

const seedProducts = async () => {
  try {
    await connectDB();
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log('✅ Success! Products seeded.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

seedProducts();
