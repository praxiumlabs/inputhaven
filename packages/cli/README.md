# InputHaven CLI

Command-line interface for InputHaven - Universal Form Protocol

## Installation

```bash
npm install -g inputhaven-cli
```

## Quick Start

```bash
# Login with your API key
inputhaven login

# List your forms
inputhaven forms

# Submit to a form
inputhaven submit <form-id> -d '{"name": "John", "email": "john@test.com"}'

# Initialize in current directory
inputhaven init
```

## Commands

### Authentication

```bash
# Login with API key
inputhaven login
inputhaven login --api-key YOUR_KEY

# Logout
inputhaven logout

# Check auth status
inputhaven whoami
```

### Forms

```bash
# List all forms
inputhaven forms
inputhaven ls

# Get form details
inputhaven form <id>
inputhaven form <id> --schema
```

### Submissions

```bash
# Submit with JSON data
inputhaven submit <form-id> -d '{"name": "John"}'

# Submit from file
inputhaven submit <form-id> -f data.json

# Interactive submission
inputhaven submit <form-id>
```

### Templates

```bash
# List templates
inputhaven templates
inputhaven templates --type FORM_SCHEMA
inputhaven templates --category contact
```

### Semantic Types

```bash
# List all types
inputhaven types

# List types in namespace
inputhaven types person
inputhaven types organization
```

### Project Setup

```bash
# Initialize in current directory
inputhaven init
# Creates inputhaven.json and example form.html
```

## Configuration

The CLI stores credentials in:
- macOS: `~/Library/Preferences/inputhaven-nodejs/`
- Windows: `%APPDATA%/inputhaven-nodejs/Config/`
- Linux: `~/.config/inputhaven-nodejs/`

## Examples

### Quick Form Submission

```bash
# One-liner submission (no login required)
curl -X POST https://api.inputhaven.com/v1/submit \
  -H "Content-Type: application/json" \
  -d '{"access_key": "YOUR_KEY", "name": "John", "email": "john@test.com"}'
```

### Batch Submissions

```bash
# Submit multiple entries from file
for entry in $(cat entries.json | jq -c '.[]'); do
  inputhaven submit form-id -d "$entry"
done
```

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Submit deployment notification
  run: |
    inputhaven submit ${{ secrets.FORM_ID }} \
      -d '{"event": "deploy", "version": "${{ github.sha }}"}'
  env:
    INPUTHAVEN_API_KEY: ${{ secrets.INPUTHAVEN_API_KEY }}
```

## Self-Hosted

```bash
inputhaven login --base-url https://api.your-domain.com
```

## License

MIT
