const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const pool = require("../database/db");

const RESET_CODE_EXPIRY_MINUTES = 15;

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

const register = async (req, res) => {
  try {
    const fullName = String(req.body.fullName || "").trim();
    const password = String(req.body.password || "");
    const email = normalizeEmail(req.body.email);

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "Full name, email and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters.",
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE LOWER(email) = LOWER($1)",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "Email is already registered.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, full_name, email, created_at`,
      [fullName, email, passwordHash]
    );

    return res.status(201).json({
      message: "User registered successfully.",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Register error:", error.message);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Email is already registered.",
      });
    }

    return res.status(500).json({
      message: "Server error during registration.",
    });
  }
};

const login = async (req, res) => {
  try {
    const password = String(req.body.password || "");
    const email = normalizeEmail(req.body.email);

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE LOWER(email) = LOWER($1)",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const user = result.rows[0];

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      message: "Server error during login.",
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    if (!email) {
      return res.status(400).json({
        message: "Email is required.",
      });
    }

    const userResult = await pool.query(
      "SELECT id FROM users WHERE LOWER(email) = LOWER($1)",
      [email]
    );

    const response = {
      message: "If this email exists, a verification code has been generated.",
    };

    if (userResult.rows.length === 0) {
      return res.status(200).json(response);
    }

    const user = userResult.rows[0];
    const resetCode = crypto.randomInt(100000, 1000000).toString();
    const codeHash = await bcrypt.hash(resetCode, 10);

    await pool.query("DELETE FROM password_reset_codes WHERE user_id = $1", [
      user.id,
    ]);

    await pool.query(
      `INSERT INTO password_reset_codes (user_id, code_hash, expires_at)
       VALUES ($1, $2, NOW() + ($3 * INTERVAL '1 minute'))`,
      [user.id, codeHash, RESET_CODE_EXPIRY_MINUTES]
    );

    if (process.env.NODE_ENV !== "production") {
      response.resetCode = resetCode;
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error("Forgot password error:", error.message);
    return res.status(500).json({
      message: "Server error while creating reset code.",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const code = String(req.body.code || "").trim();
    const newPassword = String(req.body.newPassword || "");

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        message: "Email, verification code and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters.",
      });
    }

    const userResult = await pool.query(
      "SELECT id FROM users WHERE LOWER(email) = LOWER($1)",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid or expired verification code.",
      });
    }

    const user = userResult.rows[0];

    const codeResult = await pool.query(
      `SELECT id, code_hash
       FROM password_reset_codes
       WHERE user_id = $1
         AND used_at IS NULL
         AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [user.id]
    );

    if (codeResult.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid or expired verification code.",
      });
    }

    const resetRecord = codeResult.rows[0];
    const isCodeCorrect = await bcrypt.compare(code, resetRecord.code_hash);

    if (!isCodeCorrect) {
      return res.status(400).json({
        message: "Invalid or expired verification code.",
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      passwordHash,
      user.id,
    ]);

    await pool.query(
      "UPDATE password_reset_codes SET used_at = NOW() WHERE id = $1",
      [resetRecord.id]
    );

    return res.status(200).json({
      message: "Password has been reset successfully.",
    });
  } catch (error) {
    console.error("Reset password error:", error.message);
    return res.status(500).json({
      message: "Server error while resetting password.",
    });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
};
