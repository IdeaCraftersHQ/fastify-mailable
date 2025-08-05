import { Recipient, RecipientInput } from '../types'

export function normalizeRecipients(input: RecipientInput | undefined): Recipient[] | undefined {
  if (!input) return undefined

  const recipients: Recipient[] = []
  const inputs = Array.isArray(input) ? input : [input]

  for (const item of inputs) {
    if (typeof item === 'string') {
      recipients.push({ address: item })
    } else if (item && typeof item === 'object' && 'address' in item) {
      recipients.push(item)
    }
  }

  return recipients.length > 0 ? recipients : undefined
}

export function formatRecipient(recipient: Recipient): string {
  if (recipient.name) {
    return `"${recipient.name}" <${recipient.address}>`
  }
  return recipient.address
}

export function formatRecipients(recipients: Recipient[] | undefined): string | string[] | undefined {
  if (!recipients) return undefined
  
  const formatted = recipients.map(formatRecipient)
  return formatted.length === 1 ? formatted[0] : formatted
}