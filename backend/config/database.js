const { Sequelize } = require('sequelize');
const pg = require('pg');
require('dotenv').config();

// Neon.tech requires SSL for connections
const isProduction = process.env.NODE_ENV === 'production';

let sequelize;

// Use DATABASE_URL if available (preferred for Neon.tech)
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectModule: pg,
    logging: isProduction ? false : console.log,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Required for Neon.tech
      },
    },
    pool: {
      max: 5, // Neon.tech free tier has connection limits
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: false,
    },
  });
} else {
  // Fallback to individual DB variables
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      dialectModule: pg,
      logging: isProduction ? false : console.log,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      define: {
        timestamps: true,
        underscored: false,
      },
    }
  );
}

// Test connection function
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully');
    return true;
  } catch (error) {
    console.error('✗ Unable to connect to the database:', error.message);
    return false;
  }
};

module.exports = sequelize;
module.exports.testConnection = testConnection;
