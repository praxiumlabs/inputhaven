#!/usr/bin/env node

import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import inquirer from 'inquirer'
import Conf from 'conf'
import { InputHaven, submit } from '@inputhaven/sdk'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const VERSION = '1.0.0'
const config = new Conf({ projectName: 'inputhaven' })

const program = new Command()

// ASCII banner
const banner = chalk.cyan(`
╔═══════════════════════════════════════════╗
║     📥 InputHaven CLI v${VERSION}              ║
║     Universal Form Protocol               ║
╚═══════════════════════════════════════════╝
`)

// ==================== HELPERS ====================

function getClient(): InputHaven | null {
  const apiKey = config.get('apiKey') as string
  const baseUrl = config.get('baseUrl') as string
  
  if (!apiKey) {
    console.log(chalk.yellow('⚠️  Not logged in. Run: inputhaven login'))
    return null
  }
  
  return new InputHaven({
    apiKey,
    baseUrl: baseUrl || undefined
  })
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString()
}

// ==================== COMMANDS ====================

program
  .name('inputhaven')
  .description('InputHaven CLI - Universal Form Protocol')
  .version(VERSION)

// Login command
program
  .command('login')
  .description('Authenticate with InputHaven')
  .option('-k, --api-key <key>', 'API key')
  .option('-u, --base-url <url>', 'Custom API base URL')
  .action(async (options) => {
    console.log(banner)
    
    let apiKey = options.apiKey
    let baseUrl = options.baseUrl
    
    if (!apiKey) {
      const answers = await inquirer.prompt([
        {
          type: 'password',
          name: 'apiKey',
          message: 'Enter your API key:',
          mask: '*'
        },
        {
          type: 'input',
          name: 'baseUrl',
          message: 'Custom API URL (leave empty for default):',
          default: ''
        }
      ])
      apiKey = answers.apiKey
      baseUrl = answers.baseUrl
    }
    
    const spinner = ora('Verifying credentials...').start()
    
    try {
      const client = new InputHaven({
        apiKey,
        baseUrl: baseUrl || undefined
      })
      
      // Test the connection
      const forms = await client.getForms({ limit: 1 })
      
      if (forms.success) {
        config.set('apiKey', apiKey)
        if (baseUrl) config.set('baseUrl', baseUrl)
        
        spinner.succeed(chalk.green('Logged in successfully!'))
        console.log(chalk.dim('Credentials saved locally.'))
      } else {
        spinner.fail(chalk.red('Invalid API key'))
      }
    } catch (error) {
      spinner.fail(chalk.red('Authentication failed'))
      console.error(error)
    }
  })

// Logout command
program
  .command('logout')
  .description('Remove stored credentials')
  .action(() => {
    config.delete('apiKey')
    config.delete('baseUrl')
    console.log(chalk.green('✓ Logged out successfully'))
  })

// Whoami command
program
  .command('whoami')
  .description('Show current authentication status')
  .action(() => {
    const apiKey = config.get('apiKey') as string
    const baseUrl = config.get('baseUrl') as string
    
    if (apiKey) {
      console.log(chalk.green('✓ Authenticated'))
      console.log(chalk.dim(`  API Key: ${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`))
      if (baseUrl) {
        console.log(chalk.dim(`  Base URL: ${baseUrl}`))
      }
    } else {
      console.log(chalk.yellow('✗ Not authenticated'))
      console.log(chalk.dim('  Run: inputhaven login'))
    }
  })

// List forms
program
  .command('forms')
  .alias('ls')
  .description('List all forms')
  .option('-l, --limit <number>', 'Number of forms', '20')
  .action(async (options) => {
    const client = getClient()
    if (!client) return
    
    const spinner = ora('Loading forms...').start()
    
    try {
      const response = await client.getForms({ limit: parseInt(options.limit) })
      spinner.stop()
      
      if (response.success && response.data) {
        console.log(chalk.bold(`\n📋 Your Forms (${response.data.length})\n`))
        
        if (response.data.length === 0) {
          console.log(chalk.dim('No forms found. Create one with: inputhaven create'))
          return
        }
        
        for (const form of response.data) {
          const status = form.isActive 
            ? chalk.green('●') 
            : chalk.gray('○')
          
          console.log(`${status} ${chalk.bold(form.name)}`)
          console.log(chalk.dim(`  ID: ${form.id}`))
          console.log(chalk.dim(`  Access Key: ${form.accessKey}`))
          console.log(chalk.dim(`  Submissions: ${form.submissionCount}`))
          console.log('')
        }
      } else {
        console.log(chalk.red('Failed to load forms'))
      }
    } catch (error) {
      spinner.fail('Failed to load forms')
      console.error(error)
    }
  })

// Get form details
program
  .command('form <id>')
  .description('Get form details')
  .option('-s, --schema', 'Show schema')
  .action(async (id, options) => {
    const client = getClient()
    if (!client) return
    
    const spinner = ora('Loading form...').start()
    
    try {
      const response = await client.getForm(id)
      spinner.stop()
      
      if (response.success && response.data) {
        const form = response.data
        
        console.log(chalk.bold(`\n📝 ${form.name}\n`))
        console.log(`ID:           ${form.id}`)
        console.log(`Access Key:   ${form.accessKey}`)
        console.log(`Status:       ${form.isActive ? chalk.green('Active') : chalk.gray('Inactive')}`)
        console.log(`Submissions:  ${form.submissionCount}`)
        console.log(`Created:      ${formatDate(form.createdAt)}`)
        
        if (options.schema) {
          console.log(chalk.bold('\nSchema:'))
          console.log(JSON.stringify(form.schema, null, 2))
        }
        
        console.log(chalk.bold('\n📤 Quick Submit:'))
        console.log(chalk.dim(`curl -X POST https://api.inputhaven.com/v1/submit \\`))
        console.log(chalk.dim(`  -H "Content-Type: application/json" \\`))
        console.log(chalk.dim(`  -d '{"access_key": "${form.accessKey}", "name": "Test"}'`))
      } else {
        console.log(chalk.red('Form not found'))
      }
    } catch (error) {
      spinner.fail('Failed to load form')
      console.error(error)
    }
  })

// Submit to form
program
  .command('submit <formId>')
  .description('Submit data to a form')
  .option('-d, --data <json>', 'JSON data to submit')
  .option('-f, --file <path>', 'JSON file to submit')
  .action(async (formId, options) => {
    let data: Record<string, any>
    
    if (options.file) {
      if (!existsSync(options.file)) {
        console.log(chalk.red(`File not found: ${options.file}`))
        return
      }
      data = JSON.parse(readFileSync(options.file, 'utf-8'))
    } else if (options.data) {
      data = JSON.parse(options.data)
    } else {
      // Interactive mode
      console.log(chalk.dim('Enter form data (Ctrl+C to cancel):\n'))
      
      const answers = await inquirer.prompt([
        { type: 'input', name: 'name', message: 'Name:' },
        { type: 'input', name: 'email', message: 'Email:' },
        { type: 'input', name: 'message', message: 'Message:' }
      ])
      
      data = Object.fromEntries(
        Object.entries(answers).filter(([_, v]) => v)
      )
    }
    
    const spinner = ora('Submitting...').start()
    
    try {
      const result = await submit(formId, data)
      
      if (result.success) {
        spinner.succeed(chalk.green('Submitted successfully!'))
        if (result.submissionId) {
          console.log(chalk.dim(`Submission ID: ${result.submissionId}`))
        }
      } else {
        spinner.fail(chalk.red(`Failed: ${result.error?.message}`))
      }
    } catch (error) {
      spinner.fail('Submission failed')
      console.error(error)
    }
  })

// List templates
program
  .command('templates')
  .description('List available templates')
  .option('-t, --type <type>', 'Filter by type')
  .option('-c, --category <category>', 'Filter by category')
  .action(async (options) => {
    const client = getClient()
    if (!client) return
    
    const spinner = ora('Loading templates...').start()
    
    try {
      const response = await client.getTemplates({
        type: options.type,
        category: options.category,
        includeSystem: true,
        includePublic: true
      })
      spinner.stop()
      
      if (response.success && response.data) {
        console.log(chalk.bold(`\n📋 Templates (${response.data.length})\n`))
        
        for (const template of response.data) {
          const badge = template.isSystem 
            ? chalk.yellow('[System]') 
            : chalk.blue('[Custom]')
          
          console.log(`${badge} ${chalk.bold(template.name)}`)
          console.log(chalk.dim(`  Type: ${template.type}`))
          if (template.category) {
            console.log(chalk.dim(`  Category: ${template.category}`))
          }
          if (template.description) {
            console.log(chalk.dim(`  ${template.description}`))
          }
          console.log('')
        }
      }
    } catch (error) {
      spinner.fail('Failed to load templates')
      console.error(error)
    }
  })

// Semantic types
program
  .command('types [namespace]')
  .description('List semantic types')
  .action(async (namespace) => {
    const client = getClient()
    if (!client) return
    
    const spinner = ora('Loading semantic types...').start()
    
    try {
      const response = await client.getSemanticTypes(namespace)
      spinner.stop()
      
      if (response.success && response.data) {
        console.log(chalk.bold(`\n🏷️  Semantic Types\n`))
        
        // Group by namespace
        const byNamespace = response.data.reduce((acc: any, type: any) => {
          if (!acc[type.namespace]) acc[type.namespace] = []
          acc[type.namespace].push(type)
          return acc
        }, {})
        
        for (const [ns, types] of Object.entries(byNamespace)) {
          console.log(chalk.bold.cyan(`${ns}/`))
          for (const type of types as any[]) {
            console.log(`  ${type.name}`)
            console.log(chalk.dim(`    ${type.description}`))
          }
          console.log('')
        }
      }
    } catch (error) {
      spinner.fail('Failed to load types')
      console.error(error)
    }
  })

// Init command - create inputhaven.json
program
  .command('init')
  .description('Initialize InputHaven in current directory')
  .action(async () => {
    console.log(banner)
    
    if (existsSync('inputhaven.json')) {
      console.log(chalk.yellow('inputhaven.json already exists'))
      return
    }
    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'formId',
        message: 'Form ID or access key:'
      },
      {
        type: 'confirm',
        name: 'createExample',
        message: 'Create example HTML form?',
        default: true
      }
    ])
    
    // Create config file
    const configContent = {
      formId: answers.formId,
      apiUrl: 'https://api.inputhaven.com',
      sdk: '@inputhaven/sdk'
    }
    
    writeFileSync('inputhaven.json', JSON.stringify(configContent, null, 2))
    console.log(chalk.green('✓ Created inputhaven.json'))
    
    if (answers.createExample) {
      const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Contact Form</title>
  <script src="https://cdn.inputhaven.com/sdk.min.js"></script>
</head>
<body>
  <form id="contact-form">
    <input type="text" name="name" placeholder="Name" required>
    <input type="email" name="email" placeholder="Email" required>
    <textarea name="message" placeholder="Message"></textarea>
    <button type="submit">Send</button>
  </form>

  <script>
    InputHaven.init('${answers.formId}')
    InputHaven.attach('#contact-form', {
      onSuccess: () => alert('Thanks!'),
      onError: (err) => alert('Error: ' + err.message)
    })
  </script>
</body>
</html>`
      
      writeFileSync('form.html', htmlContent)
      console.log(chalk.green('✓ Created form.html'))
    }
    
    console.log(chalk.dim('\nNext steps:'))
    console.log(chalk.dim('  1. Edit inputhaven.json with your form ID'))
    console.log(chalk.dim('  2. Open form.html in browser to test'))
  })

// Parse and run
program.parse()
