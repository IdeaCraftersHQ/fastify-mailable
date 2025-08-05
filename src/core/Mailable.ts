import {
  EmailContent,
  RecipientInput,
  Attachment,
  MailableContract
} from '../types'
import { normalizeRecipients } from '../utils/recipients'

export abstract class Mailable implements MailableContract {
  protected content: EmailContent = {}
  protected viewTemplate?: string
  protected viewData?: any
  protected markdownTemplate?: string
  protected markdownData?: any
  protected selectedMailer?: string

  abstract build(): this | Promise<this>

  to(address: RecipientInput): this {
    this.content.to = normalizeRecipients(address)
    return this
  }

  cc(address: RecipientInput): this {
    this.content.cc = normalizeRecipients(address)
    return this
  }

  bcc(address: RecipientInput): this {
    this.content.bcc = normalizeRecipients(address)
    return this
  }

  replyTo(address: RecipientInput): this {
    this.content.replyTo = normalizeRecipients(address)
    return this
  }

  from(address: RecipientInput): this {
    this.content.from = normalizeRecipients(address)?.[0]
    return this
  }

  subject(subject: string): this {
    this.content.subject = subject
    return this
  }

  priority(priority: 'high' | 'normal' | 'low'): this {
    this.content.priority = priority
    return this
  }

  attach(path: string, options?: Partial<Attachment>): this {
    const attachment: Attachment = {
      path,
      ...options
    }

    if (!this.content.attachments) {
      this.content.attachments = []
    }

    this.content.attachments.push(attachment)
    return this
  }

  attachData(data: string | Buffer, filename: string, options?: Partial<Attachment>): this {
    const attachment: Attachment = {
      content: data,
      filename,
      ...options
    }

    if (!this.content.attachments) {
      this.content.attachments = []
    }

    this.content.attachments.push(attachment)
    return this
  }

  header(name: string, value: string | string[]): this {
    if (!this.content.headers) {
      this.content.headers = {}
    }

    this.content.headers[name] = value
    return this
  }

  headers(headers: Record<string, string | string[]>): this {
    this.content.headers = { ...this.content.headers, ...headers }
    return this
  }

  view(template: string, data?: any): this {
    this.viewTemplate = template
    this.viewData = data
    return this
  }

  text(content: string): this {
    this.content.text = content
    return this
  }

  html(content: string): this {
    this.content.html = content
    return this
  }

  markdown(template: string, data?: any): this {
    this.markdownTemplate = template
    this.markdownData = data
    return this
  }

  mailer(name: string): this {
    this.selectedMailer = name
    return this
  }

  async render(): Promise<EmailContent> {
    // This method will be enhanced when we implement template engines
    return { ...this.content }
  }

  protected async beforeSend(): Promise<void> {
    // Hook for subclasses
  }

  protected async afterSend(_result: any): Promise<void> {
    // Hook for subclasses
  }

  getMailer(): string | undefined {
    return this.selectedMailer
  }

  getViewTemplate(): { template?: string; data?: any } {
    return {
      template: this.viewTemplate,
      data: this.viewData
    }
  }

  getMarkdownTemplate(): { template?: string; data?: any } {
    return {
      template: this.markdownTemplate,
      data: this.markdownData
    }
  }
}