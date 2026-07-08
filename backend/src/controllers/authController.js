const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Category = require('../models/Category');
const defaultCategories = require('../data/defaultCategories');
const chatController = require('./chatController');

// Helper function to create default categories for new users
async function createDefaultCategories(userId) {
  try {
    const categoryPromises = defaultCategories.map(category =>
      Category.create({
        userId,
        name: category.name,
        type: category.type,
        color: category.color,
        icon: category.icon
      })
    );
    await Promise.all(categoryPromises);
    console.log(`Created ${defaultCategories.length} default categories for user ${userId}`);
  } catch (error) {
    console.error('Error creating default categories:', error);
    // Don't throw - user creation should succeed even if category creation fails
  }
}

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = await User.create({ email, password, name });

    // Create default categories for the new user
    await createDefaultCategories(user.id);

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        onboardingCompleted: user.onboarding_completed
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await User.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        onboardingCompleted: user.onboarding_completed
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.googleAuth = async (req, res) => {
  try {
    const { googleId, email, name } = req.body;

    let user = await User.findByGoogleId(googleId);
    let isNewUser = false;

    if (!user) {
      user = await User.findByEmail(email);

      if (!user) {
        const crypto = require('crypto');
        const randomPassword = crypto.randomBytes(32).toString('hex');
        user = await User.create({ email, name, password: randomPassword, googleId });
        isNewUser = true;
      }
    }

    // Create default categories for new users
    if (isNewUser) {
      await createDefaultCategories(user.id);
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Google authentication successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        onboardingCompleted: user.onboarding_completed
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
};

exports.logout = async (req, res) => {
  try {
    const userId = req.userId;

    // Clear cached Ollama endpoint for this user
    chatController.clearUserCache(userId);

    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

exports.completeOnboarding = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.markOnboardingComplete(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Onboarding completed successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatar_url,
        onboardingCompleted: user.onboarding_completed
      }
    });
  } catch (error) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({ error: 'Failed to complete onboarding' });
  }
};
