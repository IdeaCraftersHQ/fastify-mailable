import Fastify from 'fastify'
import fastifyMailable, { Mailable } from '../src'

// Example mailable with potential issues
class ProblematicEmail extends Mailable {
  constructor(
    private user: { name: string; email: string },
    private options: { useUnverifiedSender?: boolean } = {}
  ) {
    super()
  }

  build() {
    const email = this.to(this.user.email, this.user.name)
      .subject('Test Email with Error Handling')
      .html(`<p>Hello ${this.user.name}!</p>`)
      .text(`Hello ${this.user.name}!`)

    // Optionally use an unverified sender to trigger SMTP error
    if (this.options.useUnverifiedSender) {
      email.from('unverified@example.com', 'Unverified Sender')
    }

    return email
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
      name: 'Verified App',
      address: 'verified@example.com' // This should be a verified sender
    },
    mailers: {
      smtp: {
        transport: 'smtp',
        host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
        port: parseInt(process.env.SMTP_PORT || '2525'),
        auth: {
          user: process.env.SMTP_USER || 'test',
          pass: process.env.SMTP_PASS || 'test'
        }
      }
    }
  }
})

// Route demonstrating proper error handling
fastify.post('/send-email', async (request, reply) => {
  const { email, name, useUnverifiedSender } = request.body as any

  try {
    const result = await fastify.mail.send(
      new ProblematicEmail(
        { name, email },
        { useUnverifiedSender }
      )
    )

    // Success - email was accepted by SMTP server
    return {
      success: true,
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected,
      response: result.response
    }
  } catch (error) {
    // Error - email was rejected or failed
    request.log.error(error)
    
    const errorMessage = (error as Error).message
    
    // Check for specific SMTP errors
    if (errorMessage.includes('Invalid sender') || errorMessage.includes('Invalid \'From\'')) {
      return reply.code(400).send({
        success: false,
        error: 'Invalid sender address. Please use a verified sender.',
        details: errorMessage
      })
    }
    
    if (errorMessage.includes('rejected')) {
      return reply.code(422).send({
        success: false,
        error: 'Email was rejected by the mail server.',
        details: errorMessage
      })
    }
    
    // Generic email sending error
    return reply.code(500).send({
      success: false,
      error: 'Failed to send email.',
      details: errorMessage
    })
  }
})

// Route to test email configuration
fastify.get('/test-smtp', async (request, reply) => {
  try {
    const isValid = await fastify.mail.verify()
    return {
      success: isValid,
      message: isValid 
        ? 'SMTP configuration is valid' 
        : 'SMTP configuration is invalid'
    }
  } catch (error) {
    return reply.code(500).send({
      success: false,
      error: 'Failed to verify SMTP configuration',
      details: (error as Error).message
    })
  }
})

// Start the server
const start = async () => {
  try {
    await fastify.listen({ port: 3000 })
    console.log('Server running on http://localhost:3000')
    console.log('\nAvailable endpoints:')
    console.log('- POST /send-email { email, name, useUnverifiedSender? }')
    console.log('- GET /test-smtp')
    console.log('\nEnvironment variables:')
    console.log('- SMTP_HOST (default: smtp.mailtrap.io)')
    console.log('- SMTP_PORT (default: 2525)')
    console.log('- SMTP_USER')
    console.log('- SMTP_PASS')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()