# AgriFlow

AgriFlow is a farm activity and yield tracking system for managing fields,
daily farm work, harvest records, and yield performance from one dashboard.

## Features

- Farmer registration and login with JWT authentication
- Case-insensitive duplicate email protection
- Password reset flow with verification code
- Field, farm activity, and harvest record management
- Yield per hectare calculation and yield status labels
- Dashboard statistics and yearly yield summaries
- Swagger API documentation

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: PostgreSQL
- Auth: JWT, bcrypt
- Tests: Jest
- API docs: Swagger UI

## Project Structure

```text
AgriFlow/
  agriflow/
    backend/
      src/
        controllers/
        database/
        middlewares/
        routes/
        services/
      tests/
    frontend/
      assets/
      index.html
      forgot-password.html
      app.js
      forgot-password.js
      style.css
```

## Local Setup

1. Install backend dependencies:

   ```bash
   cd agriflow/backend
   npm install
   ```

2. Create a local environment file:

   ```bash
   cp .env.example .env
   ```

3. Fill in your PostgreSQL credentials and set a strong `JWT_SECRET`:

   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=agriflow
   DB_USER=postgres
   DB_PASSWORD=your-password
   JWT_SECRET=your-long-random-secret
   ```

4. Start the server:

   ```bash
   npm start
   ```

5. Open the app:

   ```text
   http://localhost:3000
   ```

## Useful Commands

```bash
# Start backend
npm start

# Start backend with nodemon
npm run dev

# Run tests
npm test
```

## API Documentation

After starting the backend, Swagger UI is available at:

```text
http://localhost:3000/api-docs
```

## Password Reset

The password reset page is available at:

```text
http://localhost:3000/forgot-password.html
```

In development, the verification code is returned in the API response and shown
on the reset page so the flow can be tested without an email provider.
In production, connect the generated verification code to an email or SMS
delivery service and do not expose the code in the response.

## Security Notes

- Keep `.env` out of Git.
- Use a strong, private `JWT_SECRET`.
- Do not commit real database passwords or tokens.
- Password reset codes are stored hashed and expire after 15 minutes.
