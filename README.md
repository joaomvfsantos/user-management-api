# User Management API

This is a RESTful API for managing user registration, authentication, and profile management using Node.js and NestJS.

## Setup and Installation

1. Clone the repository:
   ```
   git clone https://github.com/joaomvfsantos/user-management-api.git
   cd user-management-api
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the application:
   ```
   npm run start:dev
   ```

The API will be available at `http://localhost:3000`.

## API Endpoints

- POST /users - Register a new user
- POST /auth/login - Login and receive a JWT token
- POST /auth/logout - Logout and add JWT to a blacklist (requires authentication)
- GET /users/:id - Get the user's profile (requires authentication, can only get own user)
- PUT /users/:id - Update the user's profile (requires authentication, can only update own user)

### Requires Authentication
For these endpoints an `Authorization` header with the `Bearer jwt` value must be set.

### Info about the logout
JWT are by definition, stateless. However this approach uses a blacklist of token that holds tokens
that were "logged out". This means that a request that is done with a blacklisted token will fail with 401.

Furthermore we should not keep these tokens forever in the list, a cronjob that runs every day is used, and deletes
from the database all expired tokens.

### Updating the user
The PUT /users/:id endpoint only allows to update the password. For this both the `old_password` and `password` must
be present in the request body

## Postman collection

An importable [Postman](https://www.postman.com/) collection is provided in the `postman_collection.json` file.

## Quick note on the database

This sample app uses SQLite as it makes running the app easier with no need to setup external databases
like Postgres or MySQL.


## Testing

To run the tests, use the following command:

```
npm run test
```