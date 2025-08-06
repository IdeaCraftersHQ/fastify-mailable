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

describe('Mailable render', () => {
  it('should render email content with HTML', async () => {
    const mailable = new TestDebugMailable('John')
    const content = await mailable.render()
    
    expect(content.html).toBe('<h1>Hello John!</h1><p>This is a test email.</p>')
    expect(content.text).toBe('Hello John! This is a test email.')
    expect(content.subject).toBe('Test Email')
    expect(content.to).toEqual([{ address: 'test@example.com' }])
  })

  it('should render email content without HTML', async () => {
    const mailable = new NoHtmlMailable()
    const content = await mailable.render()
    
    expect(content.html).toBeUndefined()
    expect(content.text).toBe('This email has no HTML content.')
    expect(content.subject).toBe('Text Only')
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
    const content = await mailable.render()
    
    expect(buildCalled).toBe(true)
    expect(content.html).toBe('<p>Built successfully</p>')
  })

  it('should only call build once even with multiple render calls', async () => {
    let buildCount = 0
    
    class CountBuildMailable extends Mailable {
      build() {
        buildCount++
        return this.html('<p>Built</p>')
      }
    }

    const mailable = new CountBuildMailable()
    await mailable.render()
    await mailable.render()
    await mailable.render()
    
    expect(buildCount).toBe(1)
  })
})