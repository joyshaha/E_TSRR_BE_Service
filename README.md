# Express Backend — Quick Start

Small Express + MongoDB + PostgreSQL (Sequelize) backend used in the project.

## Prerequisites
- Node.js (v16+ recommended)
- A MongoDB connection string in [.env](.env) (MONGODB_URI)
- JWT secret in [.env](.env) (JWT_SECRET)
- A PostgreSQL connection string in [.env](.env) (PG_URI)

## Key files
- Server entry: [server.js](server.js)
- DB connection: [`connectDB`](config/db.js) — [config/db.js](config/mongo.js)
- DB connection: [`connectDB`](config/pg.js) — [config/pg.js](config/pg.js)
- Auth middleware: [`auth`](middleware/auth.js) — [middleware/auth.js](middleware/auth.js)
- Routes:
  - [routes/auth.js](routes/auth.js)
  - [routes/users.js](routes/users.js)
  - [routes/home.js](routes/home.js)
- Models:
  - [models/User.js](models/User.js)
  - [models/Product.js](models/Product.js)
- Package config: [package.json](package.json)

## Install
```sh
npm install
```