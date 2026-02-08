const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use persistent disk path in production, local path in development
const dbDir = process.env.NODE_ENV === 'production'
  ? (process.env.DB_PATH || '/opt/render/project/src/data')
  : __dirname;

const dbPath = path.join(dbDir, 'blood_donor.db');
const db = new sqlite3.Database(dbPath);

// Initialize database schema
function initializeDatabase() {
  db.serialize(() => {
    // Users table - unified registration
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Unified user profiles - single profile for both donor and recipient roles
    db.run(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER UNIQUE NOT NULL,
        
        -- Donor fields
        bloodGroup TEXT,
        weight REAL,
        age INTEGER,
        gender TEXT,
        lastDonationDate TEXT,
        isSmoker INTEGER DEFAULT 0,
        isDrinker INTEGER DEFAULT 0,
        hasDisease INTEGER DEFAULT 0,
        diseaseDetails TEXT,
        isEligibleDonor INTEGER DEFAULT 0,
        
        -- Recipient fields
        address TEXT,
        emergencyContact TEXT,
        
        -- Profile completion flags
        isDonorProfileComplete INTEGER DEFAULT 0,
        isRecipientProfileComplete INTEGER DEFAULT 0,
        
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    // Emergency requests
    db.run(`
      CREATE TABLE IF NOT EXISTS emergency_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipientId INTEGER NOT NULL,
        bloodGroup TEXT NOT NULL,
        urgency TEXT NOT NULL,
        hospitalName TEXT NOT NULL,
        hospitalAddress TEXT NOT NULL,
        contactPhone TEXT NOT NULL,
        notes TEXT,
        status TEXT DEFAULT 'active',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        resolvedAt DATETIME,
        FOREIGN KEY (recipientId) REFERENCES users(id)
      )
    `);

    // Donor responses
    db.run(`
      CREATE TABLE IF NOT EXISTS donor_responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        requestId INTEGER NOT NULL,
        donorId INTEGER NOT NULL,
        respondedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (requestId) REFERENCES emergency_requests(id),
        FOREIGN KEY (donorId) REFERENCES users(id)
      )
    `);

    console.log('✓ Database initialized successfully');
  });
}

// Blood group compatibility matrix
const bloodCompatibility = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+']
};

// Check if donor blood group is compatible with recipient need
function isBloodCompatible(donorBloodGroup, recipientBloodGroup) {
  return bloodCompatibility[donorBloodGroup]?.includes(recipientBloodGroup) || false;
}

// Calculate days since last donation
function daysSinceLastDonation(lastDonationDate) {
  if (!lastDonationDate) return Infinity;
  const lastDate = new Date(lastDonationDate);
  const now = new Date();
  const diffTime = Math.abs(now - lastDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Check if donor is eligible based on cooldown period
function isEligibleByCooldown(gender, lastDonationDate) {
  const daysSince = daysSinceLastDonation(lastDonationDate);
  const requiredCooldown = gender === 'male' ? 90 : 120;
  return daysSince >= requiredCooldown;
}

module.exports = {
  db,
  initializeDatabase,
  isBloodCompatible,
  isEligibleByCooldown,
  daysSinceLastDonation
};
