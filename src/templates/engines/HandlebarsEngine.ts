import { TemplateEngine } from '../../types'
import * as path from 'path'
import * as fs from 'fs/promises'

interface HandlebarsEngineOptions {
  path?: string
  extension?: string
  cache?: boolean
  helpers?: Record<string, Function>
  partials?: Record<string, string>
}

export class HandlebarsEngine implements TemplateEngine {
  private handlebars: any
  private cache: Map<string, any> = new Map()
  private options: HandlebarsEngineOptions

  constructor(options: HandlebarsEngineOptions = {}) {
    this.options = {
      extension: '.hbs',
      cache: process.env.NODE_ENV === 'production',
      ...options
    }

    // Lazy load handlebars
    try {
      this.handlebars = require('handlebars')
    } catch (error) {
      throw new Error('Handlebars is not installed. Please install it: npm install handlebars')
    }

    // Register helpers if provided
    if (this.options.helpers) {
      Object.entries(this.options.helpers).forEach(([name, helper]) => {
        this.handlebars.registerHelper(name, helper)
      })
    }

    // Register partials if provided
    if (this.options.partials) {
      Object.entries(this.options.partials).forEach(([name, partial]) => {
        this.handlebars.registerPartial(name, partial)
      })
    }
  }

  async render(template: string, data: any): Promise<string> {
    const compiled = this.handlebars.compile(template)
    return compiled(data)
  }

  async renderFile(filePath: string, data: any): Promise<string> {
    const fullPath = this.resolveTemplatePath(filePath)

    // Check cache
    if (this.options.cache && this.cache.has(fullPath)) {
      const compiled = this.cache.get(fullPath)
      return compiled(data)
    }

    try {
      // Read template file
      const template = await fs.readFile(fullPath, 'utf-8')
      
      // Compile template
      const compiled = this.handlebars.compile(template)

      // Cache if enabled
      if (this.options.cache) {
        this.cache.set(fullPath, compiled)
      }

      return compiled(data)
    } catch (error) {
      throw new Error(`Failed to render template ${filePath}: ${(error as Error).message}`)
    }
  }

  private resolveTemplatePath(filePath: string): string {
    // If absolute path, use as is
    if (path.isAbsolute(filePath)) {
      return filePath
    }

    // If template path is configured, resolve relative to it
    if (this.options.path) {
      const withExtension = filePath.endsWith(this.options.extension!) 
        ? filePath 
        : filePath + this.options.extension
      
      return path.join(this.options.path, withExtension)
    }

    // Otherwise resolve relative to current working directory
    return path.join(process.cwd(), filePath)
  }

  registerHelper(name: string, helper: Function): void {
    this.handlebars.registerHelper(name, helper)
  }

  registerPartial(name: string, partial: string): void {
    this.handlebars.registerPartial(name, partial)
  }

  clearCache(): void {
    this.cache.clear()
  }
}