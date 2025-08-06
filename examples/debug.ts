import Fastify from 'fastify'
import fastifyMailable, { Mailable } from '../src'

// Create a test mailable
class DebugEmail extends Mailable {
  constructor(private user: { name: string; email: string }) {
    super()
  }

  build() {
    return this
      .to(this.user.email, this.user.name)
      .subject('Debug Test Email')
      .priority('high')
      .html(`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Hello ${this.user.name}!</h1>
          <p>This is a debug test email to demonstrate the renderHtml functionality.</p>
          <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2>Features demonstrated:</h2>
            <ul>
              <li>HTML content rendering</li>
              <li>Dynamic data binding</li>
              <li>Email styling</li>
            </ul>
          </div>
          <p style="color: #666; font-size: 14px;">
            Generated on ${new Date().toLocaleDateString()}
          </p>
        </div>
      `)
      .text(`Hello ${this.user.name}!\n\nThis is a debug test email.\n\nGenerated on ${new Date().toLocaleDateString()}`)
  }
}

// Create Fastify instance
const fastify = Fastify({
  logger: true
})

// Register the plugin
fastify.register(fastifyMailable, {
  config: {
    default: 'log',
    from: 'debug@example.com',
    mailers: {
      log: {
        transport: 'log'
      }
    }
  }
})

// Route to render email HTML for debugging
fastify.get('/debug-email', async (request, reply) => {
  const user = {
    name: 'John Doe',
    email: 'john@example.com'
  }

  try {
    // Create the mailable
    const email = new DebugEmail(user)
    
    // Render the email content
    const content = await email.render()
    
    if (!content.html) {
      return reply.code(404).send({ error: 'No HTML content found' })
    }

    // Return HTML for browser preview
    reply.type('text/html')
    return content.html
  } catch (error) {
    request.log.error(error)
    return reply.code(500).send({ 
      error: 'Failed to render email HTML' 
    })
  }
})

// Route to render via mailer (same result)
fastify.get('/debug-email-via-mailer', async (request, reply) => {
  const user = {
    name: 'Jane Doe',
    email: 'jane@example.com'
  }

  try {
    const email = new DebugEmail(user)
    const content = await email.render()
    
    if (!content.html) {
      return reply.code(404).send({ error: 'No HTML content found' })
    }

    reply.type('text/html')
    return content.html
  } catch (error) {
    request.log.error(error)
    return reply.code(500).send({ 
      error: 'Failed to render email HTML' 
    })
  }
})

// Start the server
const start = async () => {
  try {
    await fastify.listen({ port: 3000 })
    console.log('Server running on http://localhost:3000')
    console.log('Debug routes:')
    console.log('- GET /debug-email - Render email HTML directly')
    console.log('- GET /debug-email-via-mailer - Render via mailer')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()