const pool = require("./db");

const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS fields (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        field_name VARCHAR(100) NOT NULL,
        city VARCHAR(100) NOT NULL,
        district VARCHAR(100),
        crop_type VARCHAR(100) NOT NULL,
        field_area NUMERIC(10,2) NOT NULL,
        soil_type VARCHAR(100),
        planting_date DATE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS farm_activities (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        field_id INTEGER NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
        activity_type VARCHAR(100) NOT NULL,
        activity_date DATE NOT NULL,
        description TEXT,
        cost NUMERIC(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS harvest_records (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        field_id INTEGER NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
        crop_type VARCHAR(100) NOT NULL,
        total_harvest_amount NUMERIC(10,2) NOT NULL,
        unit VARCHAR(20) DEFAULT 'kg',
        harvest_date DATE NOT NULL,
        season_year INTEGER NOT NULL,
        yield_per_hectare NUMERIC(10,2) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Database tables created successfully.");
  } catch (error) {
    console.error("Database initialization error:", error.message);
  }
};

module.exports = initDb;