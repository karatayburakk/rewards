# User Daily Rewards Application - rewards

The User Daily Rewards Application provides a way for users to collect rewards over a weekly cycle.
Each reward can be collected once per day, and the dates are adjusted based on the user's time zone.
(Time Zone information expected from client side of the application when user registers)

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)

## Introduction

The User Rewards Application provides a way for users to collect rewards over a weekly cycle.
Each reward can be collected once per day, and the dates are adjusted based on the user's time zone.

- There is a Postman collection with all the endpoints and example usage available in the /postman folder.
- For usage of Postman, create environment with url (localhost:3000) and jwt variables, jwt will be set automatically with signup and signin

## Features

- User registration with time zone support -> {{url}}/auth/signup POST
- User signs the application with time zone preserved -> {{url}}/auth/signin POST
- User sees account info with total coins owned -> {{url}}/users/info GET
- Weekly reward system with daily rewards -> {{url}}/user-rewards/days GET
- Users collect daily rewards based on the current date and time, adjusted to their specific time zone. -> {{url}}/user-rewards/collect POST
- Automatic cycle reset after a missed reward
- Display all rewards that user claimed based on the user's time zone -> {{url}}/user-rewards/history GET
- Track total coins collected by each user
- Display total coin that user has -> {{url}}/user-rewards/total-coins
- System healtch can be checked -> {{url}}/health GET

## Technologies

- Node.js
- NestJS
- Prisma ORM
- PostgreSQL
- Docker (for containerization)
- moment-timezone (for date and time handling)
- TypeScript

## Installation

### Prerequisites

- Docker installed (the application and database are fully containerized and can be used with Docker)
- For local usage: PostgreSQL (or your choice of database) set up, Node.js and yarn installed
- For the application running as expected, database must be seeded, please follow steps accordingly.

### Steps

1. Set up environment variables. Create a `.env` file in the root directory and add the following (There is a template file .env.template):

- DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<database>?schema=public"
- SECRET_KEY="your_jwt_secret"

2. Production Environment With Migrations And Seeds, Run the following command:

```sh
START_MODE=migrate docker-compose up
```

- This command starts a PostgreSQL database container, migrates and seeds the database, then starts the application.

3. Production Environment, If Database migration and seed is completed already, you can run the following command:

```sh
START_MODE=prod docker-compose up
```

- This command starts a PostgresSQL database container, then starts the application

4. Development Environment, Run the following command for Development mode, all the changes in src folder will restart the application automatically.

```sh
docker-compose up
```

- This command starts a PostgresSQL database container (without migration and seed), then starts the application.

5. For Local Development, Run following commands:

- Database should be up on and running

- For Database Migration:

```sh
yarn migrate
```

- For Database seed:

```sh
yarn seed
```

- For Application running in development mode:

```sh
yarn start:dev
```
