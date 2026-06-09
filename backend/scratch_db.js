const mongoose = require('mongoose');

async function run() {
  try {
    await mongoose.connect('mongodb://localhost:27017/whatsapp-website-builder');
    console.log('Connected to DB');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    for (const coll of collections) {
      const docs = await db.collection(coll.name).find().limit(5).toArray();
      console.log(`\n--- ${coll.name} ---`);
      console.log(JSON.stringify(docs, null, 2));
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
