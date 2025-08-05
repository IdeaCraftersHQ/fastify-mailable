import { 
  MailerConfig, 
  Transport,
  TemplateEngine,
  TransportConfig,
  MailerContract
} from '../types'
import { Mailer } from './Mailer'
import { createTransport } from '../transports'
import { createTemplateEngine } from '../templates'

export class MailManager {
  private mailers: Map<string, MailerContract> = new Map()
  private transports: Map<string, Transport> = new Map()
  private config: MailerConfig
  private templateEngine?: TemplateEngine
  private templatesPath?: string

  constructor(config: MailerConfig = {}, templatesPath?: string) {
    this.config = config
    this.templatesPath = templatesPath
    this.initializeTemplateEngine()
  }

  private initializeTemplateEngine(): void {
    // Default to Handlebars template engine
    this.templateEngine = createTemplateEngine('handlebars', {
      path: this.templatesPath,
      ...this.config.markdown
    })
  }

  mailer(name?: string): MailerContract {
    const mailerName = name || this.config.default || 'default'

    // Return cached mailer if exists
    if (this.mailers.has(mailerName)) {
      return this.mailers.get(mailerName)!
    }

    // Create new mailer
    const transport = this.getTransport(mailerName)
    const mailer = new Mailer(transport, this.templateEngine, this.config.from)
    
    this.mailers.set(mailerName, mailer)
    return mailer
  }

  private getTransport(name: string): Transport {
    // Return cached transport if exists
    if (this.transports.has(name)) {
      return this.transports.get(name)!
    }

    // Get transport config
    const transportConfig = this.config.mailers?.[name]
    if (!transportConfig) {
      throw new Error(`Mailer configuration not found for: ${name}`)
    }

    // Create transport
    const transport = createTransport(transportConfig)
    this.transports.set(name, transport)
    
    return transport
  }

  addMailer(name: string, config: TransportConfig): void {
    if (!this.config.mailers) {
      this.config.mailers = {}
    }
    
    this.config.mailers[name] = config
    
    // Clear cached mailer and transport
    this.mailers.delete(name)
    this.transports.delete(name)
  }

  setDefaultMailer(name: string): void {
    this.config.default = name
  }

  setDefaultFrom(from: any): void {
    this.config.from = from
  }

  setTemplateEngine(engine: TemplateEngine): void {
    this.templateEngine = engine
    // Clear all cached mailers to use new template engine
    this.mailers.clear()
  }

  async closeAll(): Promise<void> {
    const closePromises: Promise<void>[] = []

    for (const transport of this.transports.values()) {
      if (transport.close) {
        closePromises.push(transport.close())
      }
    }

    await Promise.all(closePromises)
    
    this.transports.clear()
    this.mailers.clear()
  }
}