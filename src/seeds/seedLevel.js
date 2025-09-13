import { Level } from '../models/level.model.js';

export const seedLevels = async () => {
  try {
    const existingLevels = await Level.find();
    if (existingLevels.length === 0) {
      await Level.insertMany([
        { name: 'mầm' },
        { name: 'chồi' },
        { name: 'lá' }
      ]);
      console.log('✅ Levels seeded successfully');
    }
  } catch (error) {
    console.error('❌ Error seeding levels:', error);
  }
};