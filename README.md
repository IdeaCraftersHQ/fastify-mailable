# @ideacrafters/fastify-mailable

Elegant email composition and delivery for Fastify applications, inspired by Laravel's Mailable functionality.

## Features

- 🚀 **Fluent API** - Chainable methods for email composition
- 📧 **Multiple Transports** - SMTP, AWS SES, SendGrid, Mailgun, and more
- 📝 **Template Support** - Handlebars, EJS, Pug, Nunjucks
- ⚡ **Queue Integration** - Async email delivery with Bull/BullMQ
- 🔌 **Fastify Plugin** - Seamless integration with Fastify
- 📦 **TypeScript** - Full type definitions included

## Installation

```bash
npm install @ideacrafters/fastify-mailable

# Install optional dependencies as needed
npm install handlebars        # For Handlebars templates
npm install @aws-sdk/client-ses  # For AWS SES
npm install @sendgrid/mail    # For SendGrid
npm install bullmq            # For queue support
```

## Quick Start

```typescript
import Fastify from 'fastify'
import fastifyMailable, { Mailable } from '@ideacrafters/fastify-mailable'

// Create a mailable class
class WelcomeEmail extends Mailable {
  constructor(private user: { name: string; email: string }) {
    super()
  }

  build() {
    return this
      .to(this.user.email, this.user.name)
      .subject('Welcome!')
      .html(`<h1>Welcome ${this.user.name}!</h1>`)
  }
}

// Register the plugin
const fastify = Fastify()

fastify.register(fastifyMailable, {
  config: {
    default: 'smtp',
    from: 'noreply@example.com',
    mailers: {
      smtp: {
        transport: 'smtp',
        host: 'smtp.example.com',
        port: 587,
        auth: {
          user: 'username',
          pass: 'password'
        }
      }
    }
  }
})

// Send an email
fastify.post('/send', async (request, reply) => {
  await fastify.mail.send(new WelcomeEmail({
    name: 'John Doe',
    email: 'john@example.com'
  }))
  
  return { sent: true }
})
```

## Configuration

### Basic Configuration

```javascript
{
  default: 'smtp',              // Default mailer to use
  from: {                       // Default from address
    address: 'noreply@example.com',
    name: 'My App'
  },
  mailers: {                    // Mailer configurations
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
  }
}
```

### Available Transports

- **smtp** - SMTP via Nodemailer
- **ses** - AWS SES
- **sendgrid** - SendGrid API
- **mailgun** - Mailgun API
- **postmark** - Postmark API
- **log** - Console logging (development)
- **array** - In-memory storage (testing)

## Creating Mailables

### Basic Mailable

```typescript
class InvoiceEmail extends Mailable {
  constructor(private invoice: Invoice) {
    super()
  }

  build() {
    return this
      .to(this.invoice.customer.email)
      .subject(`Invoice #${this.invoice.number}`)
      .attach(this.invoice.pdfPath, { 
        filename: `invoice-${this.invoice.number}.pdf` 
      })
      .view('emails.invoice', { invoice: this.invoice })
  }
}
```

### Using Templates

```typescript
class NewsletterEmail extends Mailable {
  build() {
    return this
      .subject('Monthly Newsletter')
      .view('newsletter', { 
        month: 'January',
        articles: this.articles 
      })
  }
}
```

### Markdown Emails

```typescript
class ReportEmail extends Mailable {
  build() {
    return this
      .subject('Weekly Report')
      .markdown('emails.report', { data: this.reportData })
  }
}
```

## Sending Emails

### Direct Sending

```typescript
// Send immediately
await fastify.mail.send(new WelcomeEmail(user))

// Use a different mailer
await fastify.mail
  .mailer('ses')
  .send(new CriticalAlert(data))
```

### Queued Sending

```typescript
// Queue for background processing
await fastify.mail.queue(new NewsletterEmail(subscribers))

// Send after delay (5 minutes)
await fastify.mail.later(300, new ReminderEmail(user))
```

### Bulk Sending

```typescript
const emails = users.map(user => new WelcomeEmail(user))
await fastify.mail.bulk(emails)
```

## Templates

### Handlebars (Default)

```handlebars
<!-- emails/welcome.hbs -->
<h1>Welcome {{user.name}}!</h1>
<p>Thanks for joining our platform.</p>
```

### Register Template Helpers

```typescript
const handlebarsEngine = new HandlebarsEngine({
  helpers: {
    formatDate: (date) => new Date(date).toLocaleDateString(),
    uppercase: (str) => str.toUpperCase()
  }
})

mailManager.setTemplateEngine(handlebarsEngine)
```

## Testing

Use the array transport for testing:

```typescript
const fastify = Fastify()

fastify.register(fastifyMailable, {
  config: {
    default: 'array',
    mailers: {
      array: { transport: 'array' }
    }
  }
})

// In tests
const transport = fastify.mail.transport as ArrayTransport
const emails = transport.getEmails()
expect(emails).toHaveLength(1)
expect(emails[0].subject).toBe('Welcome!')
```

## Error Handling

The module properly handles SMTP errors and will throw exceptions when emails fail to send:

```typescript
try {
  await fastify.mail.send(new WelcomeEmail(user))
} catch (error) {
  // Handle specific SMTP errors
  const message = error.message
  
  if (message.includes('Invalid sender')) {
    // Sender address is not verified/allowed
  } else if (message.includes('rejected')) {
    // Email was rejected by SMTP server
  } else {
    // Other sending errors
  }
}
```

Common error scenarios:
- **Invalid sender**: The from address is not verified with your SMTP provider
- **Rejected recipients**: The SMTP server rejected one or more recipients
- **Authentication errors**: Invalid SMTP credentials
- **Connection errors**: Unable to connect to SMTP server

## API Reference

### Mailable Methods

- `to(address)` - Set recipient(s)
- `cc(address)` - Set CC recipient(s)
- `bcc(address)` - Set BCC recipient(s)
- `from(address)` - Set from address
- `replyTo(address)` - Set reply-to address
- `subject(subject)` - Set email subject
- `priority(priority)` - Set priority (high/normal/low)
- `attach(path, options)` - Attach file
- `attachData(data, filename)` - Attach raw data
- `header(name, value)` - Set custom header
- `view(template, data)` - Use template
- `text(content)` - Set plain text content
- `html(content)` - Set HTML content
- `markdown(template, data)` - Use markdown template
- `mailer(name)` - Use specific mailer

### Mailer Methods

- `send(mailable)` - Send email immediately
- `queue(mailable)` - Queue for sending
- `later(delay, mailable)` - Send after delay
- `bulk(mailables)` - Send multiple emails
- `raw(content)` - Send raw email content

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Idea Crafters](https://github.com/IdeaCraftersHQ)

---

Built with ❤️ by [Idea Crafters](https://github.com/IdeaCraftersHQ)