import Fastify from 'fastify'
import fastifyMailable, { Mailable } from '../src'
import * as path from 'path'

// Create mailables using templates
class OrderConfirmation extends Mailable {
  constructor(
    private order: {
      id: string
      customer: { name: string; email: string }
      items: Array<{ name: string; price: number; quantity: number }>
      total: number
    }
  ) {
    super()
  }

  build() {
    return this
      .to(this.order.customer.email, this.order.customer.name)
      .subject(`Order Confirmation #${this.order.id}`)
      .view('order-confirmation', { order: this.order })
  }
}

class PasswordReset extends Mailable {
  constructor(
    private user: { name: string; email: string },
    private resetUrl: string
  ) {
    super()
  }

  build() {
    return this
      .to(this.user.email, this.user.name)
      .subject('Reset Your Password')
      .priority('high')
      .view('password-reset', {
        user: this.user,
        resetUrl: this.resetUrl,
        expiresIn: '24 hours'
      })
  }
}

// Create Fastify instance
const fastify = Fastify({
  logger: true
})

// Register the plugin
fastify.register(fastifyMailable, {
  config: {
    default: 'log', // Using log transport for demo
    from: {
      name: 'E-Commerce Store',
      address: 'orders@store.com'
    },
    mailers: {
      log: {
        transport: 'log'
      }
    }
  },
  templatesPath: path.join(__dirname, 'templates')
})

// Routes
fastify.post('/send-order-confirmation', async (request, reply) => {
  const order = {
    id: 'ORD-12345',
    customer: {
      name: 'John Doe',
      email: 'john@example.com'
    },
    items: [
      { name: 'Product 1', price: 29.99, quantity: 2 },
      { name: 'Product 2', price: 49.99, quantity: 1 }
    ],
    total: 109.97
  }

  try {
    await fastify.mail.send(new OrderConfirmation(order))
    return { success: true, message: 'Order confirmation sent' }
  } catch (error) {
    request.log.error(error)
    return reply.code(500).send({ 
      success: false, 
      error: 'Failed to send email' 
    })
  }
})

fastify.post('/send-password-reset', async (request, reply) => {
  const { email } = request.body as any
  
  // Mock user lookup
  const user = {
    name: 'John Doe',
    email
  }
  
  const resetUrl = `https://store.com/reset-password?token=abc123`

  try {
    await fastify.mail.send(new PasswordReset(user, resetUrl))
    return { success: true, message: 'Password reset email sent' }
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
    console.log('Available endpoints:')
    console.log('- POST /send-order-confirmation')
    console.log('- POST /send-password-reset { email }')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()