import { Transport, EmailContent } from '../types'

export class ArrayTransport implements Transport {
  private emails: EmailContent[] = []

  async send(mail: EmailContent): Promise<any> {
    this.emails.push({ ...mail })

    return {
      messageId: `<${Date.now()}.${Math.random().toString(36).substr(2, 9)}@array.local>`,
      accepted: [mail.to].flat(),
      rejected: [],
      pending: [],
      response: 'Email stored in array'
    }
  }

  getEmails(): EmailContent[] {
    return [...this.emails]
  }

  clearEmails(): void {
    this.emails = []
  }

  count(): number {
    return this.emails.length
  }

  findBySubject(subject: string): EmailContent[] {
    return this.emails.filter(email => email.subject === subject)
  }

  findByRecipient(recipient: string): EmailContent[] {
    return this.emails.filter(email => {
      const recipients = [
        ...(Array.isArray(email.to) ? email.to : [email.to]),
        ...(Array.isArray(email.cc) ? email.cc : email.cc ? [email.cc] : []),
        ...(Array.isArray(email.bcc) ? email.bcc : email.bcc ? [email.bcc] : [])
      ].flat()

      return recipients.some(r => 
        typeof r === 'string' ? r === recipient : r?.address === recipient
      )
    })
  }
}