import Fastify from 'fastify'
import fastifyMailable, { Mailable } from '../src'

// Create a custom mailable class
class WelcomeEmail extends Mailable {
  constructor(private user: { name: string; email: string }) {
    super()
  }

  build() {
    return this
      .to(this.user.email, this.user.name)
      .subject('Welcome to our Platform!')
      .html(`
        <h1>Welcome ${this.user.name}!</h1>
        <p>Thank you for joining our platform.</p>
        <p>Best regards,<br>The Team</p>
      `)
      .text(`Welcome ${this.user.name}!\n\nThank you for joining our platform.\n\nBest regards,\nThe Team`)
  }
}

// Create Fastify instance
const fastify = Fastify({
  logger: true
})

// Register the plugin
fastify.register(fastifyMailable, {
  config: {
    default: 'smtp',
    from: {
      name: 'My App',
      address: 'noreply@myapp.com'
    },
    mailers: {
      smtp: {
        transport: 'smtp',
        host: 'localhost',
        port: 1025, // MailHog default port
        secure: false
      },
      log: {
        transport: 'log'
      }
    }
  },
  templatesPath: './emails'
})

// Define a route that sends an email
fastify.post('/send-welcome', async (request, reply) => {
  const { name, email } = request.body as any

  try {
    // Send the email
    const result = await fastify.mail.send(
      new WelcomeEmail({ name, email })
    )

    return { success: true, messageId: result.messageId }
  } catch (error) {
    request.log.error(error)
    return reply.code(500).send({ 
      success: false, 
      error: 'Failed to send email' 
    })
  }
})

// Start the server
const start = async () => {
  try {
    await fastify.listen({ port: 3000 })
    console.log('Server running on http://localhost:3000')
    console.log('POST /send-welcome with { name, email } to send a welcome email')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()