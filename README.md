# AgriFlow

Farm Activity and Yield Tracking System.

## Local setup

1. Install backend dependencies:

   ```bash
   cd agriflow/backend
   npm install
   ```

2. Create a local environment file from the example:

   ```bash
   cp .env.example .env
   ```

3. Fill in your local PostgreSQL credentials and a strong `JWT_SECRET` in `.env`.

The `.env` file is intentionally ignored by Git. Keep real tokens, database passwords, and private keys out of commits.
