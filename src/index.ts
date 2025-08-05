import fastifyPlugin from './plugins/fastifyPlugin'

// Core exports
export { Mailable } from './core/Mailable'
export { Mailer } from './core/Mailer'
export { MailManager } from './core/MailManager'

// Transport exports
export { SmtpTransport, LogTransport, ArrayTransport } from './transports'

// Template engine exports
export { HandlebarsEngine } from './templates'

// Type exports
export * from './types'

// Default export is the Fastify plugin
export default fastifyPlugin