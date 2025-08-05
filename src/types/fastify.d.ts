import { MailerContract } from './index'
import { MailManager } from '../core/MailManager'
import { Mailable } from '../core/Mailable'

declare module 'fastify' {
  interface FastifyInstance {
    mail: MailerContract
    mailManager: MailManager
    mailable: typeof Mailable
  }

  interface FastifyRequest {
    mail: () => MailerContract
  }
}