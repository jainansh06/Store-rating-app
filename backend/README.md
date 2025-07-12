# Store Rating Platform - Backend API

A comprehensive Node.js backend API built with Express.js and PostgreSQL for a store rating platform with role-based authentication.

## Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin, User, Store Owner)
  - Password hashing with bcrypt
  - Secure password validation

- **User Management**
  - User registration and login
  - Profile management
  - Password updates
  - Admin user management

- **Store Management**
  - Store creation and management
  - Store owner assignment
  - Store search and filtering

- **Rating System**
  - Submit and update store ratings (1-5 scale)
  - View store ratings and analytics
  - User-specific rating tracking

- **Admin Dashboard**
  - Platform statistics
  - User and store management
  - Comprehensive filtering and sorting

## Tech Stack

- **Backend Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: helmet, cors, rate limiting

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=store_rating_db
   DB_USER=your_username
   DB_PASSWORD=your_password
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

4. **Set up PostgreSQL database**
   - Create a PostgreSQL database named `store_rating_db`
   - Update database credentials in `.env` file

5. **Initialize database**
   ```bash
   npm run init-db
   ```

6. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `PUT /api/auth/password` - Update password
- `GET /api/auth/profile` - Get user profile

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID (Admin only)

### Stores
- `GET /api/stores` - Get all stores
- `GET /api/stores/:id` - Get store by ID
- `GET /api/stores/owner/my-stores` - Get owned stores (Store Owner only)

### Ratings
- `POST /api/ratings/stores/:storeId` - Submit/update rating
- `GET /api/ratings/stores/:storeId/my-rating` - Get user's rating for store
- `GET /api/ratings/stores/:storeId` - Get all ratings for store (Store Owner/Admin)
- `GET /api/ratings` - Get all ratings (Admin only)

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `POST /api/admin/stores` - Create new store
- `PUT /api/admin/stores/:id` - Update store
- `DELETE /api/admin/stores/:id` - Delete store

## Database Schema

### Users Table
- `id` (Primary Key)
- `name` (20-60 characters)
- `email` (Unique)
- `password` (Hashed)
- `address` (Max 400 characters)
- `role` (admin, user, store_owner)
- `created_at`, `updated_at`

### Stores Table
- `id` (Primary Key)
- `name` (20-60 characters)
- `email`
- `address` (Max 400 characters)
- `owner_id` (Foreign Key to Users)
- `created_at`, `updated_at`

### Ratings Table
- `id` (Primary Key)
- `user_id` (Foreign Key to Users)
- `store_id` (Foreign Key to Stores)
- `rating` (1-5)
- `created_at`, `updated_at`
- Unique constraint on (user_id, store_id)

## Validation Rules

- **Name**: 20-60 characters
- **Email**: Valid email format
- **Password**: 8-16 characters, at least one uppercase letter and one special character
- **Address**: Maximum 400 characters
- **Rating**: Integer between 1 and 5

## Default Accounts

After running `npm run init-db`, the following accounts are created:

- **Admin**: admin@example.com / Admin123!
- **Store Owner**: store@example.com / Store123!
- **User**: user@example.com / User123!

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation and sanitization
- SQL injection prevention with parameterized queries

## Error Handling

The API includes comprehensive error handling with appropriate HTTP status codes and descriptive error messages.

## Development

For development, use:
```bash
npm run dev
```

This will start the server with nodemon for automatic restarts on file changes.

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Use a production PostgreSQL database
3. Set secure JWT secret
4. Configure proper CORS origins
5. Use process manager like PM2

## API Testing

You can test the API using tools like Postman or curl. All endpoints require proper authentication headers except for registration and login.

Example authentication header:
```
Authorization: Bearer <your-jwt-token>
```