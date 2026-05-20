<div align="center">

# AgriFlow

Farm activity, field management, harvest tracking, and yield analytics in one
clean dashboard.

![Node.js](https://img.shields.io/badge/Node.js-Express-236143?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-23657A?style=for-the-badge&logo=postgresql&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Frontend-B4772A?style=for-the-badge&logo=javascript&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Authentication-17211A?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-Tests-B73B3B?style=for-the-badge&logo=jest&logoColor=white)

</div>

## Overview

AgriFlow is a full-stack farm management application designed to help farmers
track field information, daily farm activities, harvest records, and yield
performance. The app combines a simple browser-based interface with an Express
API and PostgreSQL database.

The main dashboard gives farmers a quick operational view of total fields,
logged activities, harvest records, average yield, and yearly yield summaries.

## Highlights

| Area | What AgriFlow Does |
| --- | --- |
| Field management | Store field name, city, district, crop type, area, soil type, planting date, and notes |
| Farm activities | Track fertilization, pesticide, irrigation, planting, soil preparation, harvest work, and cost |
| Harvest records | Record crop type, harvest amount, unit, date, season year, notes, and calculated yield |
| Dashboard | Review totals, average yield, and yearly crop performance |
| Authentication | Register, login, JWT-protected API routes, and password reset |
| Data safety | Duplicate email protection, password hashing, reset-code expiration, and owner-scoped records |

## Screens

| Page | Purpose |
| --- | --- |
| `index.html` | Login, registration, and authenticated dashboard |
| `forgot-password.html` | Password reset request and verification-code confirmation |
| `/api-docs` | Swagger API documentation |

## Tech Stack

| Layer | Tools |
| --- | --- |
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Authentication | JWT, bcrypt |
| Documentation | Swagger UI, swagger-jsdoc |
| Testing | Jest |

## Project Structure

```text
AgriFlow/
  README.md
  agriflow/
    backend/
      .env.example
      package.json
      src/
        config/
          swagger.js
        controllers/
          authController.js
          dashboardController.js
          fieldController.js
          activityController.js
          harvestController.js
        database/
          db.js
          initDb.js
        middlewares/
          authMiddleware.js
        routes/
          authRoutes.js
          dashboardRoutes.js
          fieldRoutes.js
          activityRoutes.js
          harvestRoutes.js
        services/
          yieldService.js
        server.js
      tests/
        yieldService.test.js
    frontend/
      assets/
        farm-operations-hero.png
      index.html
      forgot-password.html
      app.js
      forgot-password.js
      style.css
```

## Getting Started

### 1. Install dependencies

```bash
cd agriflow/backend
npm install
```

### 2. Configure environment variables

Create a local `.env` file from the example:

```bash
cp .env.example .env
```

Then update the values:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=agriflow
DB_USER=postgres
DB_PASSWORD=your-password
JWT_SECRET=your-long-random-secret
```

### 3. Prepare PostgreSQL

Create a PostgreSQL database named `agriflow` or update `DB_NAME` in `.env`.
When the backend starts, AgriFlow creates the required tables automatically:

- `users`
- `fields`
- `farm_activities`
- `harvest_records`
- `password_reset_codes`

### 4. Start the app

```bash
npm start
```

Open the frontend:

```text
http://localhost:3000
```

Open Swagger API documentation:

```text
http://localhost:3000/api-docs
```

## Useful Commands

| Command | Description |
| --- | --- |
| `npm start` | Start the Express server |
| `npm run dev` | Start the server with Nodemon |
| `npm test` | Run Jest tests |

Run commands from:

```bash
agriflow/backend
```

## Authentication Flow

### Register

New users can create an account with full name, email, and password. Email
addresses are normalized and checked case-insensitively, so these addresses are
treated as the same account:

```text
farmer@example.com
Farmer@Example.com
FARMER@example.com
```

### Login

After login, the API returns a JWT token. The frontend stores it in
`localStorage` and sends it with protected requests using the `Authorization`
header.

### Forgot Password

The password reset page is available at:

```text
http://localhost:3000/forgot-password.html
```

Flow:

1. User enters their email address.
2. Backend creates a 6-digit verification code.
3. The code is stored hashed in `password_reset_codes`.
4. The code expires after 15 minutes.
5. User submits email, code, and new password.
6. Backend verifies the code and updates the password hash.

Development note:

In non-production mode, the reset code is returned in the API response and shown
on the reset page so the flow can be tested without an email service. In
production, connect this step to email or SMS delivery and do not expose the
code in the response.

## Main API Routes

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create a farmer account |
| `POST` | `/api/auth/login` | Login and receive JWT |
| `POST` | `/api/auth/forgot-password` | Generate password reset code |
| `POST` | `/api/auth/reset-password` | Reset password with verification code |
| `GET` | `/api/dashboard/stats` | Get dashboard totals |
| `GET` | `/api/dashboard/yield-summary` | Get yearly yield summary |
| `GET` | `/api/fields` | List fields |
| `POST` | `/api/fields` | Create field |
| `GET` | `/api/activities` | List farm activities |
| `POST` | `/api/activities` | Create farm activity |
| `GET` | `/api/harvests` | List harvest records |
| `POST` | `/api/harvests` | Create harvest record |

More details are available in Swagger:

```text
http://localhost:3000/api-docs
```

## Yield Logic

AgriFlow calculates yield per hectare with:

```text
yield_per_hectare = total_harvest_amount / field_area
```

Yield status labels:

| Yield per hectare | Status |
| --- | --- |
| Below `2000` | Low Yield |
| `2000` to `3999` | Normal Yield |
| `4000` and above | High Yield |

## Security Notes

- Keep `.env` out of Git.
- Use a long, private `JWT_SECRET`.
- Never commit real database passwords, tokens, or private keys.
- User passwords are hashed with bcrypt.
- Password reset codes are hashed before storage.
- Password reset codes expire after 15 minutes.
- Protected farm data is scoped to the authenticated user.

## Current Limitations

- Password reset codes are shown in development because no email provider is
  configured yet.
- The frontend is built with plain HTML, CSS, and JavaScript, so there is no
  frontend bundler or component framework.
- Automated tests currently cover yield service logic; broader API and auth
  integration tests can be added next.
