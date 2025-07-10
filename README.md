# crud-backend

This project is a serverless CRUD backend built with Node.js, TypeScript, and the Serverless Framework.

## Prerequisites

- Node.js v18.x
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

## Development and Release Workflow

This project uses a fully automated CI/CD pipeline for development and deployment. Below is the process for contributing to the project.

### 1. Local Development

- **Branching**: All new work should be done on a feature branch created from `develop`.
- **Commits**: Commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) standard.

  A commit message consists of a **header**, a **body**, and a **footer**.

  ```
  <type>[optional scope]: <description>

  [optional body]

  [optional footer]
  ```

  - **type**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, etc.
  - **scope**: Optional, the scope of the change (e.g., `api`, `db`, `auth`).
  - **description**: A short description of the change.

- **Pull Requests**: When a feature is complete, open a pull request from your feature branch to the `develop` branch.

### 2. Continuous Integration and Deployment

- **CI Pipeline**: When a pull request is opened to `develop` or `main`, or when code is pushed to these branches, a CI workflow is triggered. This workflow runs linting, type checking, builds the code, and runs tests to ensure code quality and stability.
- **Deployment to Development**: When changes are pushed to the `develop` branch, the latest changes are automatically deployed to the **`dev`** environment after the CI workflow succeeds.
- **Deployment to Production**: When changes are pushed to the `main` branch, the new version is deployed to the **`prod`** environment after the CI workflow succeeds.
