# Editor Drag and Drop API

REST API built with Node.js, Express and MongoDB for a drag and drop design editor. It stores user designs (components and preview image), user uploaded images and the libraries of backgrounds, PNG elements, design images and templates used by the editor.

**Live demo (frontend):** <https://react-editor-drag-and-drop.davidebalice.dev/>

**Frontend repository:** <https://github.com/davidebalice/react-editor-drag-and-drop>

![Screenshot](https://www.aroundweb.it/screenshot/editor-drag.jpg)

## Features

- User registration and login with JWT
- Create, load and update designs, with a PNG preview uploaded with each save
- Delete designs and create a new design from a template
- Upload personal images to use in the editor
- Image libraries: backgrounds, PNG elements and design images
- Protected image endpoints (token in the `Authorization` header or in the `t` query parameter)
- Demo mode that blocks write operations

## Tech stack

- [Node.js](https://nodejs.org/) 20+
- [Express 5](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) with [Mongoose 9](https://mongoosejs.com/)
- [JSON Web Token](https://github.com/auth0/node-jsonwebtoken), [bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- [Formidable 3](https://github.com/node-formidable/formidable) for uploads

## Getting started

### Requirements

- Node.js 20 or later
- A MongoDB database (local or Atlas)

### Installation

```bash
git clone https://github.com/davidebalice/editor-drag-and-drop-api.git
cd editor-drag-and-drop-api
npm install
mkdir -p uploads/design uploads/images uploads/png uploads/background
```

### Configuration

Create a `.env` file in the project root:

```ini
PORT=8000
NODE_ENV=local
LOCAL_DB_URI=mongodb://127.0.0.1:27017/editor-drag-and-drop
MONGODB_URI=
JWT_SECRET=change-me
UPLOADS_DIRECTORY=/absolute/path/to/editor-drag-and-drop-api/uploads
DEMO_MODE=false
```

With `NODE_ENV=local` the API connects to `LOCAL_DB_URI`, otherwise to `MONGODB_URI`. With `NODE_ENV=production` it also serves a frontend build from `public/`.

Sample data (JSON exports of every collection) is available in the `db/` folder and can be imported with `mongoimport` or MongoDB Compass.

### Available scripts

| Command       | Description                              |
| ------------- | ---------------------------------------- |
| `npm start`   | Start the API                            |
| `npm run dev` | Start the API with `node --watch`        |

## API endpoints

All endpoints are prefixed with `/api`. Endpoints marked with * require an `Authorization: Bearer <token>` header.

| Method | Endpoint                             | Description                                   |
| ------ | ------------------------------------ | --------------------------------------------- |
| POST   | `/user-register`                     | Register a user                               |
| POST   | `/user-login`                        | Log in and receive a JWT                      |
| POST   | `/get/user` *                        | Get the user stored in the token              |
| POST   | `/create-user-design` *              | Create a design (multipart: `design`, `image`)|
| GET    | `/user-design/:design_id` *          | Get a design                                  |
| PUT    | `/update-user-design/:design_id` *   | Update a design (multipart)                   |
| GET    | `/user-designs` *                    | List the user designs                         |
| PUT    | `/delete-user-image/:design_id` *    | Delete a design                               |
| POST   | `/add-user-image` *                  | Upload a user image (multipart)               |
| GET    | `/get-user-image` *                  | List the user images                          |
| GET    | `/png-images` *                      | PNG elements library                          |
| GET    | `/background-images` *               | Backgrounds library                           |
| GET    | `/design-images` *                   | Design images library                         |
| GET    | `/templates` *                       | List templates                                |
| GET    | `/add-user-template/:template_id` *  | Create a new design from a template           |
| GET    | `/uploaded-images/:filename`         | Get a user uploaded image (token required)    |
| GET    | `/images/:filename`                  | Get an image (token required)                 |
| GET    | `/backgrounds/:filename`             | Get a background (token required)             |
| GET    | `/png/:filename`                     | Get a PNG element (token required)            |
| GET    | `/design-images/:filename`           | Get a design preview (token required)         |

## Project structure

```text
controllers/   request handlers (auth, designs)
middlewares/   JWT auth, demo mode, helpers
models/        Mongoose schemas
routes/        Express routers
db/            sample data (JSON exports)
server.js      app entry point
vercel.json    Vercel deployment config
```

## Author

**Davide Balice** – [davidebalice.dev](https://www.davidebalice.dev)
