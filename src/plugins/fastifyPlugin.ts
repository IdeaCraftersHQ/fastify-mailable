import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import { FastifyMailableOptions } from '../types'
import { MailManager } from '../core/MailManager'
import { Mailable } from '../core/Mailable'


async function fastifyMailable(
  fastify: FastifyInstance,
  options: FastifyMailableOptions
): Promise<void> {
  const { config = {}, templatesPath, defaultFrom } = options

  // Override default from if provided
  if (defaultFrom) {
    config.from = defaultFrom
  }

  // Create mail manager
  const mailManager = new MailManager(config, templatesPath)

  // Decorate fastify instance
  fastify.decorate('mailManager', mailManager)
  fastify.decorate('mail', mailManager.mailer())
  fastify.decorate('mailable', Mailable)

  // Decorate request with function (Fastify 5 compatibility)
  fastify.decorateRequest('mail', function() {
    return mailManager.mailer()
  })

  // Close all transports on server close
  fastify.addHook('onClose', async () => {
    await mailManager.closeAll()
  })
}

export default fp(fastifyMailable, {
  fastify: '>=5.0.0',
  name: '@ideacrafters/fastify-mailable'
})