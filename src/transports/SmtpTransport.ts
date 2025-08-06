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
      
      // Check if email was rejected
      if (info.rejected && info.rejected.length > 0) {
        throw new Error(`Email rejected by SMTP server: ${info.rejected.join(', ')}`)
      }
      
      // Check response for common error patterns
      if (info.response && typeof info.response === 'string') {
        const lowerResponse = info.response.toLowerCase()
        if (lowerResponse.includes('error') || lowerResponse.includes('fail') || 
            lowerResponse.includes('invalid') || lowerResponse.includes('rejected')) {
          throw new Error(`SMTP server error: ${info.response}`)
        }
      }
      
      return {
        messageId: info.messageId,
        envelope: info.envelope,
        accepted: info.accepted,
        rejected: info.rejected,
        pending: info.pending,
        response: info.response
      }
    } catch (error) {
      // Preserve original error details
      const err = error as any
      const errorMessage = err.responseCode 
        ? `SMTP Error ${err.responseCode}: ${err.response || err.message}`
        : `Failed to send email: ${err.message}`
      
      throw new Error(errorMessage)
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