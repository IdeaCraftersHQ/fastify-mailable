import { 
  EmailContent, 
  MailerContract, 
  Transport,
  TemplateEngine,
  RecipientInput
} from '../types'
import { Mailable } from './Mailable'
import { formatRecipients } from '../utils/recipients'

export class Mailer implements MailerContract {
  constructor(
    private transport: Transport,
    private templateEngine?: TemplateEngine,
    private defaultFrom?: RecipientInput
  ) {}

  async send(mailable: Mailable): Promise<any> {
    // Build the mailable
    await mailable.build()

    // Render the email content
    const content = await this.renderMailable(mailable)

    // Apply default from if not set
    if (!content.from && this.defaultFrom) {
      content.from = this.defaultFrom
    }

    // Call beforeSend hook
    await (mailable as any).beforeSend?.()

    // Send the email
    const result = await this.transport.send(this.prepareContent(content))

    // Call afterSend hook
    await (mailable as any).afterSend?.(result)

    return result
  }

  async queue(_mailable: Mailable): Promise<any> {
    // Queue implementation will be added later
    throw new Error('Queue support not implemented yet')
  }

  async later(_delay: number, _mailable: Mailable): Promise<any> {
    // Delayed queue implementation will be added later
    throw new Error('Delayed queue support not implemented yet')
  }

  async bulk(mailables: Mailable[]): Promise<any[]> {
    const results = []
    
    for (const mailable of mailables) {
      try {
        const result = await this.send(mailable)
        results.push(result)
      } catch (error) {
        results.push({ error })
      }
    }

    return results
  }

  async raw(content: EmailContent): Promise<any> {
    // Apply default from if not set
    if (!content.from && this.defaultFrom) {
      content.from = this.defaultFrom
    }

    return this.transport.send(this.prepareContent(content))
  }

  private async renderMailable(mailable: Mailable): Promise<EmailContent> {
    const content = await mailable.render()

    // Handle view template
    const { template: viewTemplate, data: viewData } = mailable.getViewTemplate()
    if (viewTemplate && this.templateEngine) {
      content.html = await this.templateEngine.renderFile(viewTemplate, viewData || {})
    }

    // Handle markdown template
    const { template: markdownTemplate, data: markdownData } = mailable.getMarkdownTemplate()
    if (markdownTemplate && this.templateEngine) {
      // For now, just render as HTML. Full markdown support will be added later
      content.html = await this.templateEngine.renderFile(markdownTemplate, markdownData || {})
    }

    return content
  }

  private prepareContent(content: EmailContent): EmailContent {
    // Convert recipients to proper format for nodemailer
    const prepared: EmailContent = { ...content }

    if (prepared.to) {
      prepared.to = formatRecipients(prepared.to as any)
    }
    if (prepared.cc) {
      prepared.cc = formatRecipients(prepared.cc as any)
    }
    if (prepared.bcc) {
      prepared.bcc = formatRecipients(prepared.bcc as any)
    }
    if (prepared.replyTo) {
      prepared.replyTo = formatRecipients(prepared.replyTo as any)
    }
    if (prepared.from) {
      prepared.from = formatRecipients([prepared.from as any])?.[0]
    }

    return prepared
  }

  async verify(): Promise<boolean> {
    if (this.transport.verify) {
      return this.transport.verify()
    }
    return true
  }

  async close(): Promise<void> {
    if (this.transport.close) {
      await this.transport.close()
    }
  }
}