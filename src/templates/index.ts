import { TemplateEngine } from '../types'
import { HandlebarsEngine } from './engines/HandlebarsEngine'

export function createTemplateEngine(engine: string, options: any = {}): TemplateEngine {
  switch (engine) {
    case 'handlebars':
      return new HandlebarsEngine(options)
    
    case 'ejs':
      throw new Error('EJS template engine not implemented yet')
    
    case 'pug':
      throw new Error('Pug template engine not implemented yet')
    
    case 'nunjucks':
      throw new Error('Nunjucks template engine not implemented yet')
    
    default:
      throw new Error(`Unknown template engine: ${engine}`)
  }
}

export { HandlebarsEngine } from './engines/HandlebarsEngine'