import nodemailer, { Transporter } from 'nodemailer'
import { Transport, EmailContent, SmtpTransportConfig } from '../types'

export class SmtpTransport implements Transport {
  private transporter: Transporter

  constructor(config: SmtpTransportConfig) {
    const { transport, ...smtpConfig } = config
    
    this.transporter = nodemailer.createTransport(smtpConfig as any)
  }

  async send(mail: EmailContent): Promise<any> {
    try {
      const info = await this.transporter.sendMail(mail as any)
      return {
        messageId: info.messageId,
        envelope: info.envelope,
        accepted: info.accepted,
        rejected: info.rejected,
        pending: info.pending,
        response: info.response
      }
    } catch (error) {
      throw new Error(`Failed to send email: ${(error as Error).message}`)
    }
  }

  async verify(): Promise<boolean> {
    try {
      await this.transporter.verify()
      return true
    } catch (error) {
      return false
    }
  }

  async close(): Promise<void> {
    this.transporter.close()
  }
}