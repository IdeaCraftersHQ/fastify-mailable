# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2024-12-19

### Fixed
- **Critical**: Fixed SMTP transport returning false success when emails fail to send
  - Now properly detects and throws errors for rejected emails
  - Checks SMTP response for error keywords (error, fail, invalid, rejected)
  - Preserves original SMTP error codes and messages for better debugging
- **Critical**: Fixed from address formatting to properly handle name and address
  - The `from()` method now correctly preserves the original format
  - Nodemailer receives properly formatted sender addresses like `"Name" <email@example.com>`
- Added comprehensive error handling tests
- Added error handling example demonstrating proper try/catch usage

### Added
- Error handling documentation in README
- Example file showing proper error handling patterns

## [1.1.0] - 2024-12-19

### Added
- `renderHtml()` method for debugging and previewing email HTML content
- Debug example showing how to preview emails in browser routes
- Tests for renderHtml functionality

## [1.0.0] - 2024-12-19

### Added
- Initial release
- Core Mailable class with fluent API
- SMTP transport support via Nodemailer
- Handlebars template engine integration
- Fastify plugin with decorators
- TypeScript support
- Log and Array transports for development/testing
- Comprehensive documentation and examples