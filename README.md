# crud-backend

This project is a serverless CRUD backend built with Node.js, TypeScript, and the Serverless Framework.

## Prerequisites

- Node.js (v18.x or later)
- npm
- AWS account and configured credentials

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/llcernicchiaro/crud-backend
   cd crud-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

## Available Scripts

- `npm test`: Run tests with Jest.
- `npm run lint`: Lint the code with ESLint.
- `npm run lint:fix`: Fix linting errors automatically.
- `npm run offline`: Run the service locally with Serverless Offline.
- `npm run dev`: Run the service in development mode with Nodemon.
- `npm run build`: Compile TypeScript to JavaScript.

## API Endpoints

The following endpoints are available:

- **GET /hello**: A sample endpoint that returns a "Hello, world!" message.

## Deployment

Deployment is automated via GitHub Actions. The `deploy.yml` workflow handles the deployment to different environments based on the branch:

- **Development (`dev`):** Pushing to the `develop` branch will trigger a deployment to the `dev` stage.
- **Production (`prod`):** Pushing to the `main` branch will trigger a deployment to the `prod` stage.

## Contributing

This project follows the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification. Please ensure your commit messages adhere to this format.

### Commit Message Format

A commit message consists of a **header**, a **body**, and a **footer**.

```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

- **type**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, etc.
- **scope**: Optional, the scope of the change (e.g., `api`, `db`, `auth`).
- **description**: A short description of the change.

For more details, please refer to the [Conventional Commits website](https://www.conventionalcommits.org/en/v1.0.0/).
