import { describe, it, expect } from 'vitest'
import { Mailable } from '../src/core/Mailable'

class TestDebugMailable extends Mailable {
  constructor(private name: string = 'Test User') {
    super()
  }

  build() {
    return this
      .to('test@example.com')
      .subject('Test Email')
      .html(`<h1>Hello ${this.name}!</h1><p>This is a test email.</p>`)
      .text(`Hello ${this.name}! This is a test email.`)
  }
}

class NoHtmlMailable extends Mailable {
  build() {
    return this
      .to('test@example.com')
      .subject('Text Only')
      .text('This email has no HTML content.')
  }
}

describe('Mailable renderHtml', () => {
  it('should render HTML content', async () => {
    const mailable = new TestDebugMailable('John')
    const html = await mailable.renderHtml()
    
    expect(html).toBe('<h1>Hello John!</h1><p>This is a test email.</p>')
  })

  it('should return null when no HTML content', async () => {
    const mailable = new NoHtmlMailable()
    const html = await mailable.renderHtml()
    
    expect(html).toBeNull()
  })

  it('should call build before rendering', async () => {
    let buildCalled = false
    
    class BuildTestMailable extends Mailable {
      build() {
        buildCalled = true
        return this.html('<p>Built successfully</p>')
      }
    }

    const mailable = new BuildTestMailable()
    const html = await mailable.renderHtml()
    
    expect(buildCalled).toBe(true)
    expect(html).toBe('<p>Built successfully</p>')
  })
})