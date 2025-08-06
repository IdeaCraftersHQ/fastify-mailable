import { describe, it, expect } from 'vitest'
import { Mailable } from '../src/core/Mailable'

class TestMailable extends Mailable {
  constructor(private data: any = {}) {
    super()
  }

  build() {
    return this
  }
}

describe('Mailable', () => {
  describe('recipients', () => {
    it('should set to recipients', async () => {
      const mailable = new TestMailable()
        .to('test@example.com')
      
      const content = await mailable.render()
      expect(content.to).toEqual([{ address: 'test@example.com' }])
    })

    it('should set multiple to recipients', async () => {
      const mailable = new TestMailable()
        .to(['user1@example.com', 'user2@example.com'])
      
      const content = await mailable.render()
      expect(content.to).toEqual([
        { address: 'user1@example.com' },
        { address: 'user2@example.com' }
      ])
    })

    it('should set recipients with names', async () => {
      const mailable = new TestMailable()
        .to({ address: 'test@example.com', name: 'Test User' })
      
      const content = await mailable.render()
      expect(content.to).toEqual([
        { address: 'test@example.com', name: 'Test User' }
      ])
    })

    it('should set cc and bcc recipients', async () => {
      const mailable = new TestMailable()
        .to('to@example.com')
        .cc('cc@example.com')
        .bcc('bcc@example.com')
      
      const content = await mailable.render()
      expect(content.cc).toEqual([{ address: 'cc@example.com' }])
      expect(content.bcc).toEqual([{ address: 'bcc@example.com' }])
    })
  })

  describe('content', () => {
    it('should set subject', async () => {
      const mailable = new TestMailable()
        .subject('Test Subject')
      
      const content = await mailable.render()
      expect(content.subject).toBe('Test Subject')
    })

    it('should set text content', async () => {
      const mailable = new TestMailable()
        .text('Plain text content')
      
      const content = await mailable.render()
      expect(content.text).toBe('Plain text content')
    })

    it('should set html content', async () => {
      const mailable = new TestMailable()
        .html('<h1>HTML content</h1>')
      
      const content = await mailable.render()
      expect(content.html).toBe('<h1>HTML content</h1>')
    })

    it('should set priority', async () => {
      const mailable = new TestMailable()
        .priority('high')
      
      const content = await mailable.render()
      expect(content.priority).toBe('high')
    })
  })

  describe('attachments', () => {
    it('should add file attachment', async () => {
      const mailable = new TestMailable()
        .attach('/path/to/file.pdf', { filename: 'document.pdf' })
      
      const content = await mailable.render()
      expect(content.attachments).toHaveLength(1)
      expect(content.attachments![0]).toEqual({
        path: '/path/to/file.pdf',
        filename: 'document.pdf'
      })
    })

    it('should add data attachment', async () => {
      const mailable = new TestMailable()
        .attachData('file content', 'file.txt', { contentType: 'text/plain' })
      
      const content = await mailable.render()
      expect(content.attachments).toHaveLength(1)
      expect(content.attachments![0]).toEqual({
        content: 'file content',
        filename: 'file.txt',
        contentType: 'text/plain'
      })
    })
  })

  describe('headers', () => {
    it('should set single header', async () => {
      const mailable = new TestMailable()
        .header('X-Custom-Header', 'value')
      
      const content = await mailable.render()
      expect(content.headers).toEqual({
        'X-Custom-Header': 'value'
      })
    })

    it('should set multiple headers', async () => {
      const mailable = new TestMailable()
        .headers({
          'X-Header-1': 'value1',
          'X-Header-2': 'value2'
        })
      
      const content = await mailable.render()
      expect(content.headers).toEqual({
        'X-Header-1': 'value1',
        'X-Header-2': 'value2'
      })
    })
  })

  describe('templates', () => {
    it('should store view template info', () => {
      const mailable = new TestMailable()
        .view('emails.welcome', { name: 'John' })
      
      const { template, data } = mailable.getViewTemplate()
      expect(template).toBe('emails.welcome')
      expect(data).toEqual({ name: 'John' })
    })

    it('should store markdown template info', () => {
      const mailable = new TestMailable()
        .markdown('emails.newsletter', { month: 'January' })
      
      const { template, data } = mailable.getMarkdownTemplate()
      expect(template).toBe('emails.newsletter')
      expect(data).toEqual({ month: 'January' })
    })
  })

  describe('mailer selection', () => {
    it('should select specific mailer', () => {
      const mailable = new TestMailable()
        .mailer('ses')
      
      expect(mailable.getMailer()).toBe('ses')
    })
  })

  describe('chaining', () => {
    it('should support method chaining', async () => {
      const mailable = new TestMailable()
        .to('user@example.com')
        .from('sender@example.com')
        .subject('Test')
        .priority('high')
        .text('Text content')
        .html('<p>HTML content</p>')
        .header('X-Test', 'value')
      
      const content = await mailable.render()
      
      expect(content.to).toEqual([{ address: 'user@example.com' }])
      expect(content.from).toBe('sender@example.com')
      expect(content.subject).toBe('Test')
      expect(content.priority).toBe('high')
      expect(content.text).toBe('Text content')
      expect(content.html).toBe('<p>HTML content</p>')
      expect(content.headers).toEqual({ 'X-Test': 'value' })
    })
  })
})