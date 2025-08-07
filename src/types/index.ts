import { FastifyPluginOptions } from 'fastify'
import SMTPTransport from 'nodemailer/lib/smtp-transport'

export interface Recipient {
  address: string
  name?: string
}

export type RecipientInput = string | Recipient | Array<string | Recipient>

export interface Attachment {
  filename?: string
  content?: string | Buffer | NodeJS.ReadableStream
  path?: string
  href?: string
  httpHeaders?: Record<string, string>
  contentType?: string
  contentDisposition?: 'attachment' | 'inline'
  cid?: string
  encoding?: string
  headers?: Record<string, string>
  raw?: string
}

export interface EmailContent {
  to?: RecipientInput
  cc?: RecipientInput
  bcc?: RecipientInput
  replyTo?: RecipientInput
  from?: RecipientInput
  sender?: RecipientInput
  subject?: string
  text?: string
  html?: string
  attachments?: Attachment[]
  headers?: Record<string, string | string[]>
  priority?: 'high' | 'normal' | 'low'
  references?: string | string[]
  inReplyTo?: string
  encoding?: string
  textEncoding?: string
  date?: Date | string
  messageId?: string
  alternatives?: Array<{
    contentType: string
    content: string | Buffer
  }>
}

export interface MailerConfig {
  default?: string
  from?: RecipientInput
  mailers?: Record<string, TransportConfig>
  markdown?: {
    theme?: string
    paths?: string[]
  }
  queue?: {
    connection?: string
    queue?: string
  }
}

export interface TransportConfig {
  transport: 'smtp' | 'ses' | 'sendgrid' | 'mailgun' | 'postmark' | 'log' | 'array' | string
  [key: string]: any
}

export interface SmtpTransportConfig extends TransportConfig {
  transport: 'smtp'
  host?: string
  port?: number
  secure?: boolean
  auth?: {
    user: string
    pass: string
  }
  pool?: boolean
  maxConnections?: number
  maxMessages?: number
  rateDelta?: number
  rateLimit?: number
  tls?: SMTPTransport.Options['tls']
}

export interface Transport {
  send(mail: EmailContent): Promise<any>
  verify?(): Promise<boolean>
  close?(): Promise<void>
}

export interface TemplateEngine {
  render(template: string, data: any): Promise<string>
  renderFile(filePath: string, data: any): Promise<string>
}

export interface QueueJob {
  id: string
  mailable: any
  delay?: number
  attempts?: number
  timestamp: number
}

export interface FastifyMailableOptions extends FastifyPluginOptions {
  config?: MailerConfig
  templatesPath?: string
  defaultFrom?: RecipientInput
}

export interface MailableContract {
  to(address: RecipientInput): this
  cc(address: RecipientInput): this
  bcc(address: RecipientInput): this
  replyTo(address: RecipientInput): this
  from(address: RecipientInput): this
  subject(subject: string): this
  priority(priority: 'high' | 'normal' | 'low'): this
  attach(path: string, options?: Partial<Attachment>): this
  attachData(data: string | Buffer, filename: string, options?: Partial<Attachment>): this
  header(name: string, value: string | string[]): this
  headers(headers: Record<string, string | string[]>): this
  view(template: string, data?: any): this
  text(content: string): this
  html(content: string): this
  markdown(template: string, data?: any): this
  mailer(name: string): this
  build(): this | Promise<this>
  render(): Promise<EmailContent>
}

export interface MailerContract {
  send(mailable: MailableContract): Promise<any>
  queue(mailable: MailableContract): Promise<any>
  later(delay: number, mailable: MailableContract): Promise<any>
  bulk(mailables: MailableContract[]): Promise<any[]>
  raw(content: EmailContent): Promise<any>
}

// Module augmentation for Fastify
declare module 'fastify' {
  interface FastifyInstance {
    mail: MailerContract
    mailManager: import('../core/MailManager').MailManager
    mailable: typeof import('../core/Mailable').Mailable
  }

  interface FastifyRequest {
    mail(): MailerContract
  }
}