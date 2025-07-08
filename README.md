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

## Development and Release Workflow

This project uses a fully automated CI/CD pipeline for development, versioning, and deployment. Below is the process for contributing to the project.

### 1. Local Development

- **Branching**: All new work should be done on a feature branch created from `develop`.
- **Commits**: Commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) standard. This is crucial for the automated versioning to work correctly.

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

- **CI Pipeline**: When a pull request is opened to `develop` or `main`, a CI workflow is triggered. This workflow runs linting, type checking, builds the code, and runs tests to ensure code quality and stability.
- **Deployment to Development**: Once a pull request is merged into the `develop` branch, the latest changes are automatically deployed to the **`dev`** environment.

### 3. Production Release

- **Merging to `main`**: To start a production release, a pull request is created from `develop` to `main`.
- **Automated Versioning**: When the pull request is merged into `main`, the `release-please` action is triggered. It analyzes the commit history, determines the next version number, and creates a new "Release PR" with the updated version in `package.json` and a new `CHANGELOG.md`.
- **Release PR Approval**: The Release PR must be reviewed and merged. This triggers the final step.
- **Deployment to Production**: Once the Release PR is merged, the new version is deployed to the **`prod`** environment, and a new release is created in GitHub.
