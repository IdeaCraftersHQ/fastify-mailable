import { Transport, TransportConfig } from '../types'
import { SmtpTransport } from './SmtpTransport'
import { LogTransport } from './LogTransport'
import { ArrayTransport } from './ArrayTransport'

export function createTransport(config: TransportConfig): Transport {
  switch (config.transport) {
    case 'smtp':
      return new SmtpTransport(config as any)
    
    case 'log':
      return new LogTransport()
    
    case 'array':
      return new ArrayTransport()
    
    case 'ses':
      throw new Error('AWS SES transport not implemented yet')
    
    case 'sendgrid':
      throw new Error('SendGrid transport not implemented yet')
    
    case 'mailgun':
      throw new Error('Mailgun transport not implemented yet')
    
    case 'postmark':
      throw new Error('Postmark transport not implemented yet')
    
    default:
      throw new Error(`Unknown transport type: ${config.transport}`)
  }
}

export { SmtpTransport } from './SmtpTransport'
export { LogTransport } from './LogTransport'
export { ArrayTransport } from './ArrayTransport'