# AI Agent Management Backend

This project is a serverless REST API backend built with Node.js, TypeScript, and the Serverless Framework. It provides CRUD (Create, Read, Update, Delete) functionality for managing AI agents, storing data in DynamoDB.

## Prerequisites

- Node.js v18.x or later
- npm
- AWS account and configured credentials
- Serverless Framework CLI (`npm install -g serverless`)

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/llcernicchiaro/crud
    cd crud/crud-backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Available Scripts

- `npm test`: Run unit and integration tests with Jest.
- `npm run lint`: Lint the code with ESLint.
- `npm run lint:fix`: Fix linting errors automatically.
- `npm run offline`: Run the service locally with Serverless Offline.
- `npm run dev`: Run the service in development mode with Nodemon.
- `npm run build`: Compile TypeScript to JavaScript.
- `sls deploy --stage dev`: Deploy the service to the `dev` AWS environment.
- `sls deploy --stage prod`: Deploy the service to the `prod` AWS environment.

## API Endpoints

The following endpoints are available for managing AI agents:

-   **POST /agents**: Creates a new AI agent.
    -   **Request Body**: `{ "name": "string", "description": "string", "model": "string", "status": "string", "temperature": "number" }`
    -   **Response**: `201 Created` with the new agent's details.
-   **GET /agents**: Retrieves a list of all AI agents.
    -   **Response**: `200 OK` with an array of agent objects.
-   **GET /agents/{id}**: Retrieves a specific AI agent by its ID.
    -   **Response**: `200 OK` with the agent's details or `404 Not Found`.
-   **PUT /agents/{id}**: Updates a specific AI agent by its ID.
    -   **Request Body**: `{ "name"?: "string", "description"?: "string", "model"?: "string", "status"?: "string", "temperature"?: "number" }` (partial updates)
    -   **Response**: `200 OK` with the updated agent's details or `404 Not Found`.
-   **DELETE /agents/{id}**: Deletes a specific AI agent by its ID.
    -   **Response**: `204 No Content` or `404 Not Found`.

## Development and Release Workflow

This project utilizes a robust CI/CD pipeline for automated development and multi-stage deployments (dev, prod) using GitHub Actions.

### 1. Local Development

-   **Branching**: All new work should be done on a feature branch created from `develop`.
-   **Commits**: Commit messages must adhere to the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) standard.

    A commit message consists of a **header**, a **body**, and a **footer**.

    ```
    <type>[optional scope]: <description>

    [optional body]

    [optional footer]
    ```

    -   **type**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, etc.
    -   **scope**: Optional, the scope of the change (e.g., `api`, `db`, `auth`).
    -   **description**: A concise description of the change.

-   **Pull Requests**: Once a feature is complete, open a pull request from your feature branch to the `develop` branch.

### 2. Continuous Integration and Deployment (CI/CD)

Our CI/CD pipeline ensures code quality and automated deployments:

-   **CI Workflow**: Triggered on pull requests to `develop` or `main`, or on direct pushes to these branches. This workflow performs linting, type checking, builds the application, and runs all tests to ensure code quality and stability.
-   **Multi-Stage Deployment**: 
    -   **Development Environment (`dev`)**: Changes pushed to the `develop` branch are automatically deployed to the `dev` AWS environment upon successful completion of the CI workflow.
    -   **Production Environment (`prod`)**: Changes pushed to the `main` branch are automatically deployed to the `prod` AWS environment upon successful completion of the CI workflow.

### CI/CD Setup Screenshots

*(Screenshots of the GitHub Actions CI/CD setup and AWS deployments will be included here upon completion.)*