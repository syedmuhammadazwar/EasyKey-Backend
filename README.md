# EasyKey Backend

A NestJS backend application with PostgreSQL database integration.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_NAME=easykey_db
   PORT=3000
   NODE_ENV=development
   ```

4. Set up PostgreSQL database:
   ```sql
   CREATE DATABASE easykey_db;
   ```

## Running the application

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

## API Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check endpoint

## Database

The application uses TypeORM with PostgreSQL. The database connection is configured in the `DatabaseModule`.

### Features
- Automatic database synchronization in development
- Connection health checks
- Migration support
- Entity-based data modeling

## Project Structure

```
src/
├── database/          # Database configuration and services
├── entities/          # TypeORM entities
├── app.controller.ts  # Main application controller
├── app.service.ts     # Main application service
├── app.module.ts      # Root application module
└── main.ts           # Application entry point
```

## Scripts

- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with hot reload
- `npm run start:debug` - Start in debug mode
- `npm run build` - Build the application
- `npm run test` - Run tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
