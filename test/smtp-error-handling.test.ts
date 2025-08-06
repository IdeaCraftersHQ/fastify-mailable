import { describe, it, expect, vi } from 'vitest'
import { SmtpTransport } from '../src/transports/SmtpTransport'
import { Mailer } from '../src/core/Mailer'
import { Mailable } from '../src/core/Mailable'

// Mock nodemailer
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn(),
      close: vi.fn(),
      verify: vi.fn()
    }))
  }
}))

class TestMailable extends Mailable {
  build() {
    return this
      .from({ address: 'unverified@example.com', name: 'Test Sender' })
      .to('recipient@example.com')
      .subject('Test Email')
      .text('Test content')
  }
}

describe('SMTP Error Handling', () => {
  it('should throw error when email is rejected', async () => {
    const nodemailer = await import('nodemailer')
    const mockSendMail = vi.fn().mockResolvedValue({
      messageId: '<123@example.com>',
      rejected: ['recipient@example.com'],
      accepted: [],
      response: '250 Message rejected'
    })

    vi.mocked(nodemailer.default.createTransport).mockReturnValue({
      sendMail: mockSendMail,
      close: vi.fn(),
      verify: vi.fn()
    } as any)

    const transport = new SmtpTransport({
      transport: 'smtp',
      host: 'smtp.example.com',
      port: 587
    })

    const mailable = new TestMailable()
    await mailable.build()
    const content = await mailable.render()

    await expect(transport.send(content)).rejects.toThrow('Email rejected by SMTP server: recipient@example.com')
  })

  it('should throw error when response contains error keywords', async () => {
    const nodemailer = await import('nodemailer')
    const mockSendMail = vi.fn().mockResolvedValue({
      messageId: '<123@example.com>',
      rejected: [],
      accepted: ['recipient@example.com'],
      response: '550 Invalid sender address'
    })

    vi.mocked(nodemailer.default.createTransport).mockReturnValue({
      sendMail: mockSendMail,
      close: vi.fn(),
      verify: vi.fn()
    } as any)

    const transport = new SmtpTransport({
      transport: 'smtp',
      host: 'smtp.example.com',
      port: 587
    })

    const mailable = new TestMailable()
    await mailable.build()
    const content = await mailable.render()

    await expect(transport.send(content)).rejects.toThrow('SMTP server error: 550 Invalid sender address')
  })

  it('should properly handle SMTP errors with response codes', async () => {
    const nodemailer = await import('nodemailer')
    const mockSendMail = vi.fn().mockRejectedValue({
      responseCode: 550,
      response: 'Invalid sender address',
      message: 'Invalid sender'
    })

    vi.mocked(nodemailer.default.createTransport).mockReturnValue({
      sendMail: mockSendMail,
      close: vi.fn(),
      verify: vi.fn()
    } as any)

    const transport = new SmtpTransport({
      transport: 'smtp',
      host: 'smtp.example.com',
      port: 587
    })

    const mailable = new TestMailable()
    await mailable.build()
    const content = await mailable.render()

    await expect(transport.send(content)).rejects.toThrow('SMTP Error 550: Invalid sender address')
  })

  it('should format from address correctly with name', async () => {
    const mailer = new Mailer({
      send: vi.fn().mockResolvedValue({ messageId: '<123@example.com>' }),
      verify: vi.fn().mockResolvedValue(true)
    })

    const mailable = new TestMailable()
    await mailer.send(mailable)

    const mockSend = vi.mocked(mailer['transport'].send)
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: '"Test Sender" <unverified@example.com>',
        to: 'recipient@example.com',
        subject: 'Test Email',
        text: 'Test content'
      })
    )
  })

  it('should use default from address when mailable does not specify one', async () => {
    const defaultFrom = { address: 'default@example.com', name: 'Default Sender' }
    const mailer = new Mailer(
      {
        send: vi.fn().mockResolvedValue({ messageId: '<123@example.com>' }),
        verify: vi.fn().mockResolvedValue(true)
      },
      undefined,
      defaultFrom
    )

    class NoFromMailable extends Mailable {
      build() {
        return this
          .to('recipient@example.com')
          .subject('Test Email')
          .text('Test content')
      }
    }

    const mailable = new NoFromMailable()
    await mailer.send(mailable)

    const mockSend = vi.mocked(mailer['transport'].send)
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: '"Default Sender" <default@example.com>'
      })
    )
  })
})