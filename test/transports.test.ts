import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ArrayTransport } from '../src/transports/ArrayTransport'
import { LogTransport } from '../src/transports/LogTransport'

describe('ArrayTransport', () => {
  let transport: ArrayTransport

  beforeEach(() => {
    transport = new ArrayTransport()
  })

  it('should store emails in array', async () => {
    const email = {
      to: 'test@example.com',
      subject: 'Test Email',
      text: 'Test content'
    }

    await transport.send(email)
    
    const emails = transport.getEmails()
    expect(emails).toHaveLength(1)
    expect(emails[0]).toMatchObject(email)
  })

  it('should return send result', async () => {
    const result = await transport.send({
      to: 'test@example.com',
      subject: 'Test'
    })

    expect(result).toHaveProperty('messageId')
    expect(result.accepted).toEqual(['test@example.com'])
    expect(result.rejected).toEqual([])
  })

  it('should find emails by subject', async () => {
    await transport.send({ to: 'user1@example.com', subject: 'Welcome' })
    await transport.send({ to: 'user2@example.com', subject: 'Newsletter' })
    await transport.send({ to: 'user3@example.com', subject: 'Welcome' })

    const welcomeEmails = transport.findBySubject('Welcome')
    expect(welcomeEmails).toHaveLength(2)
  })

  it('should find emails by recipient', async () => {
    await transport.send({ to: 'target@example.com', subject: 'Email 1' })
    await transport.send({ to: 'other@example.com', subject: 'Email 2' })
    await transport.send({ cc: 'target@example.com', subject: 'Email 3' })

    const targetEmails = transport.findByRecipient('target@example.com')
    expect(targetEmails).toHaveLength(2)
  })

  it('should clear emails', async () => {
    await transport.send({ to: 'test@example.com', subject: 'Test' })
    expect(transport.count()).toBe(1)

    transport.clearEmails()
    expect(transport.count()).toBe(0)
  })
})

describe('LogTransport', () => {
  let transport: LogTransport
  let logs: string[] = []

  beforeEach(() => {
    transport = new LogTransport()
    logs = []
    
    // Mock console.log
    vi.spyOn(console, 'log').mockImplementation((message) => {
      logs.push(message)
    })
  })

  it('should log email details', async () => {
    await transport.send({
      to: 'test@example.com',
      from: 'sender@example.com',
      subject: 'Test Email',
      text: 'Test content'
    })

    expect(logs).toContain('To: test@example.com')
    expect(logs).toContain('Subject: Test Email')
    expect(logs).toContain('From: sender@example.com')
  })

  it('should store logged emails', async () => {
    const email = {
      to: 'test@example.com',
      subject: 'Test'
    }

    await transport.send(email)
    
    const logs = transport.getLogs()
    expect(logs).toHaveLength(1)
    expect(logs[0]).toMatchObject(email)
  })

  it('should clear logs', async () => {
    await transport.send({ to: 'test@example.com', subject: 'Test' })
    expect(transport.getLogs()).toHaveLength(1)

    transport.clearLogs()
    expect(transport.getLogs()).toHaveLength(0)
  })
})