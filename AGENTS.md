<general_rules>
- Before creating new functions, search the existing codebase, especially within the `src/handlers`, `src/db`, and `src/utils` directories, to ensure functionality doesn't already exist.
- This project uses ESLint for linting and Prettier for code formatting. Run `npm run lint` to check for linting issues and `npm run lint:fix` to automatically fix them.
- All code is automatically formatted and linted before commits using pre-commit hooks configured with `husky` and `lint-staged`.
- Commit messages must adhere to the Conventional Commits specification. This is enforced by `commitlint`.
</general_rules>
<repository_structure>
- The main application logic is located in the `src` directory.
  - `handlers`: Contains the AWS Lambda function handlers for each API endpoint.
  - `db`: Manages the database client and interactions with DynamoDB.
  - `models`: Defines data structures and schemas, such as the `Agent` model.
  - `utils`: Includes shared utility functions for error handling, logging, and validation.
- The `tests` directory mirrors the `src/handlers` structure, with a dedicated test file for each handler.
- The `serverless.yml` file at the root defines the serverless architecture, including AWS resources, functions, and API endpoints.
- The `.github/workflows` directory contains the CI/CD pipelines for the project.
</repository_structure>
<dependencies_and_installation>
- This project uses `npm` for package management.
- To install all necessary dependencies, run the `npm install` command in the root directory.
- Before you can run the application, you need to have the following prerequisites installed:
  - Node.js v18.x
  - npm
  - An AWS account with configured credentials
  - The Serverless Framework CLI
</dependencies_and_installation>
<testing_instructions>
- The project uses the Jest framework for testing.
- All tests are located in the `tests` directory. Each handler in the `src/handlers` directory has a corresponding test file in the `tests` directory.
- To run all tests and generate a coverage report, execute the `npm test` command.
- When adding new features, ensure that you also add corresponding tests in the `tests` directory.
</testing_instructions>
<pull_request_formatting>
- All commit messages must follow the Conventional Commits specification. This is also reflected in the pull request titles.
- All new work should be done on a feature branch created from `develop`. Pull requests should be made from the feature branch to the `develop` branch.
</pull_request_formatting>

