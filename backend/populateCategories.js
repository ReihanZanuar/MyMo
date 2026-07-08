require('dotenv').config();
const Category = require('./src/models/Category');
const defaultCategories = require('./src/data/defaultCategories');

const USER_ID = 1;

async function populateCategories() {
  try {
    console.log(`Creating ${defaultCategories.length} default categories for user ${USER_ID}...`);

    const categoryPromises = defaultCategories.map(category =>
      Category.create({
        userId: USER_ID,
        name: category.name,
        type: category.type,
        color: category.color,
        icon: category.icon
      })
    );

    await Promise.all(categoryPromises);
    console.log(`✓ Successfully created ${defaultCategories.length} categories`);
    process.exit(0);
  } catch (error) {
    console.error('Error creating categories:', error);
    process.exit(1);
  }
}

populateCategories();
