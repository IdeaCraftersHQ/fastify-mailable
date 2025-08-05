import { Transport, EmailContent } from '../types'

export class LogTransport implements Transport {
  private logs: EmailContent[] = []

  async send(mail: EmailContent): Promise<any> {
    console.log('=== Email Log ===')
    console.log(`To: ${mail.to}`)
    console.log(`Subject: ${mail.subject}`)
    console.log(`From: ${mail.from}`)
    
    if (mail.cc) console.log(`CC: ${mail.cc}`)
    if (mail.bcc) console.log(`BCC: ${mail.bcc}`)
    if (mail.replyTo) console.log(`Reply-To: ${mail.replyTo}`)
    
    console.log('--- Content ---')
    if (mail.text) console.log('Text:', mail.text)
    if (mail.html) console.log('HTML:', mail.html?.substring(0, 200) + '...')
    
    if (mail.attachments?.length) {
      console.log('--- Attachments ---')
      mail.attachments.forEach((att, i) => {
        console.log(`${i + 1}. ${att.filename || 'Unnamed'}`)
      })
    }
    
    console.log('================\n')

    this.logs.push(mail)

    return {
      messageId: `<${Date.now()}.${Math.random().toString(36).substr(2, 9)}@log.local>`,
      accepted: [mail.to].flat(),
      rejected: [],
      pending: [],
      response: 'Email logged successfully'
    }
  }

  getLogs(): EmailContent[] {
    return [...this.logs]
  }

  clearLogs(): void {
    this.logs = []
  }
}