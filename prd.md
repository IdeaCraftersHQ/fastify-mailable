# Product Requirements Document: Fastify Mailable Module

## 1. Executive Summary

### 1.1 Product Overview
The Fastify Mailable module is a comprehensive email composition and delivery system for Fastify applications, inspired by Laravel's Mailable functionality. It provides an elegant, object-oriented approach to constructing and sending emails with support for multiple transport providers, templating engines, and queue systems.

### 1.2 Objectives
- Provide a fluent, chainable API for email composition
- Support multiple mail transport providers (SMTP, AWS SES, SendGrid, Mailgun, etc.)
- Enable template-based email rendering with multiple engine support
- Offer queue integration for asynchronous email delivery
- Maintain high performance and low overhead consistent with Fastify's philosophy

## 2. Functional Requirements

### 2.1 Core Features

#### 2.1.1 Mailable Class System
- **Base Mailable Class**: Abstract class that all email types extend
- **Fluent Interface**: Chainable methods for setting email properties
- **Auto-discovery**: Automatic property mapping from constructor parameters
- **Lifecycle Hooks**: Methods like `build()`, `beforeSend()`, `afterSend()`

#### 2.1.2 Email Composition
- **Recipients Management**
    - To, CC, BCC support with single/multiple recipients
    - Reply-to addresses
    - Sender vs From address distinction
- **Content Types**
    - HTML content
    - Plain text content
    - Automatic plain text generation from HTML
    - Markdown support with HTML compilation
- **Attachments**
    - File attachments from disk
    - Raw data attachments
    - Inline attachments for embedded images
    - Stream attachments
- **Headers**
    - Custom header support
    - Priority levels
    - Message-ID generation

#### 2.1.3 Template System
- **Multiple Template Engines**
    - Handlebars (default)
    - EJS
    - Pug
    - Nunjucks
    - Custom engine support via adapters
- **Template Resolution**
    - Convention-based template discovery
    - Explicit template specification
    - Layout/master template support
    - Partial/component support
- **Data Binding**
    - Automatic view data injection
    - Global shared data
    - Template-specific data scoping

#### 2.1.4 Transport Layer
- **Multiple Drivers**
    - SMTP (via Nodemailer)
    - AWS SES
    - SendGrid API
    - Mailgun API
    - Postmark
    - Log driver (development)
    - Array driver (testing)
- **Driver Management**
    - Runtime driver switching
    - Per-mailable driver override
    - Connection pooling for SMTP
    - Retry logic with exponential backoff

#### 2.1.5 Queue Integration
- **Queue Backends**
    - Bull/BullMQ
    - AWS SQS
    - Redis-based queuing
    - Database queue tables
    - Synchronous (immediate) sending
- **Queue Features**
    - Delayed sending
    - Priority queues
    - Retry on failure
    - Dead letter queue
    - Job batching

### 2.2 Configuration Management

#### 2.2.1 Global Configuration
```javascript
{
  default: 'smtp',
  mailers: {
    smtp: {
      transport: 'smtp',
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        user: 'username',
        pass: 'password'
      }
    },
    ses: {
      transport: 'ses',
      region: 'us-east-1',
      credentials: {
        accessKeyId: 'key',
        secretAccessKey: 'secret'
      }
    }
  },
  from: {
    address: 'noreply@example.com',
    name: 'Application Name'
  },
  markdown: {
    theme: 'default',
    paths: ['./emails/markdown']
  },
  queue: {
    connection: 'redis',
    queue: 'emails'
  }
}
```

#### 2.2.2 Environment-based Configuration
- Development, staging, production presets
- Environment variable support
- Configuration validation
- Secret management integration

### 2.3 Plugin Architecture

#### 2.3.1 Fastify Plugin Registration
```javascript
fastify.register(require('fastify-mailable'), {
  config: mailConfig,
  templatesPath: './emails',
  defaultFrom: 'noreply@example.com'
});
```

#### 2.3.2 Decorators
- `fastify.mail` - Main mailer instance
- `request.mail()` - Request-scoped mailing
- `fastify.mailable()` - Mailable factory

### 2.4 API Specifications

#### 2.4.1 Mailable Class API
```javascript
class WelcomeEmail extends Mailable {
  constructor(user) {
    super();
    this.user = user;
  }

  build() {
    return this
      .to(this.user.email, this.user.name)
      .subject('Welcome to our Platform')
      .view('emails.welcome', { user: this.user })
      .attach('/path/to/file.pdf', { as: 'welcome-guide.pdf' });
  }
}
```

#### 2.4.2 Sending API
```javascript
// Direct sending
await fastify.mail.send(new WelcomeEmail(user));

// Queued sending
await fastify.mail.queue(new WelcomeEmail(user));

// Delayed sending
await fastify.mail.later(300, new WelcomeEmail(user)); // 5 minutes

// Conditional sending
await fastify.mail.when(condition, new WelcomeEmail(user));
```

#### 2.4.3 Advanced Features
```javascript
// Bulk sending with personalization
await fastify.mail.bulk([
  new WelcomeEmail(user1),
  new WelcomeEmail(user2)
]);

// Using markdown
class ReportEmail extends Mailable {
  build() {
    return this.markdown('emails.report', this.data);
  }
}

// Custom transport per email
class CriticalAlert extends Mailable {
  build() {
    return this
      .mailer('ses')  // Use AWS SES for critical emails
      .priority('high')
      .subject('Critical System Alert');
  }
}
```

## 3. Non-Functional Requirements

### 3.1 Performance
- Minimal overhead on Fastify server startup
- Lazy loading of transport drivers
- Connection pooling and reuse
- Template caching in production
- Benchmark target: < 10ms overhead per email composition

### 3.2 Reliability
- Automatic retry with exponential backoff
- Graceful degradation on transport failure
- Failed email logging and monitoring
- Circuit breaker pattern for external services
- 99.9% delivery success rate target

### 3.3 Security
- Input sanitization for email addresses
- Template injection prevention
- Secure credential storage
- Rate limiting capabilities
- SPF/DKIM support
- Anti-spoofing measures

### 3.4 Scalability
- Horizontal scaling support
- Queue worker distribution
- Batch processing optimization
- Memory-efficient large attachment handling
- Support for 100K+ emails/hour

### 3.5 Developer Experience
- TypeScript support with full type definitions
- Comprehensive error messages
- IDE autocompletion
- Extensive documentation
- Migration guide from other systems

## 4. Technical Architecture

### 4.1 Module Structure
```
fastify-mailable/
├── src/
│   ├── core/
│   │   ├── Mailable.js
│   │   ├── Mailer.js
│   │   └── MailManager.js
│   ├── transports/
│   │   ├── SmtpTransport.js
│   │   ├── SesTransport.js
│   │   └── index.js
│   ├── templates/
│   │   ├── TemplateEngine.js
│   │   └── engines/
│   ├── queue/
│   │   ├── QueueManager.js
│   │   └── drivers/
│   ├── plugins/
│   │   └── fastifyPlugin.js
│   └── index.js
├── types/
│   └── index.d.ts
└── test/
```

### 4.2 Dependencies
- **Core**: fastify-plugin, nodemailer
- **Optional**: @aws-sdk/client-ses, @sendgrid/mail, bullmq
- **Templates**: handlebars, ejs, pug (peer dependencies)
- **Development**: typescript, jest, fastify (peer)

### 4.3 Integration Points
- Fastify lifecycle hooks
- Request/Reply context access
- Fastify logging system integration
- Schema validation using Fastify's AJV
- Metrics exposure via fastify-metrics

## 5. Testing Requirements

### 5.1 Unit Testing
- Mailable class composition
- Transport driver functionality
- Template rendering
- Queue operations
- Configuration parsing

### 5.2 Integration Testing
- End-to-end email sending
- Queue worker processing
- Multi-transport scenarios
- Template engine switching
- Error recovery

### 5.3 Testing Utilities
- Mock transport for testing
- Email assertion helpers
- Queue testing helpers
- Snapshot testing for templates

## 6. Documentation Requirements

### 6.1 API Documentation
- Complete method documentation
- Code examples for all features
- Common use case tutorials
- Troubleshooting guide

### 6.2 Guides
- Getting started guide
- Migration from Nodemailer
- Migration from Laravel
- Custom transport creation
- Template engine integration

## 7. Release Criteria

### 7.1 MVP (v1.0.0)
- Core Mailable class system
- SMTP transport support
- Basic template rendering (Handlebars)
- Synchronous sending
- TypeScript definitions

### 7.2 v1.1.0
- Queue support with Bull
- Additional transports (SES, SendGrid)
- Markdown support
- Bulk sending

### 7.3 v2.0.0
- Full Laravel Mailable API parity
- Advanced queue features
- Multiple template engine support
- Performance optimizations

## 8. Success Metrics

- Adoption rate (npm downloads)
- GitHub stars and community engagement
- Performance benchmarks vs alternatives
- Developer satisfaction scores
- Bug report frequency
- Email delivery success rates

## 9. Risks and Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Performance overhead | High | Implement lazy loading, caching |
| Complex configuration | Medium | Provide sensible defaults, validation |
| Transport API changes | Medium | Abstract behind interfaces |
| Template security | High | Sanitize inputs, use safe defaults |
| Queue job failures | Medium | Implement retry logic, monitoring |
