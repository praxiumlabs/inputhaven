# InputHaven Python SDK

Official Python SDK for InputHaven - Universal Form Protocol

[![PyPI version](https://badge.fury.io/py/inputhaven.svg)](https://pypi.org/project/inputhaven/)
[![Python](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)

## Installation

```bash
pip install inputhaven
```

## Quick Start

### One-liner Submission (No API Key Required)

```python
from inputhaven import submit

result = submit("your-form-access-key", {
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Hello!"
})

if result.success:
    print(f"Submitted! ID: {result.submission_id}")
```

### Full Client (With API Key)

```python
from inputhaven import InputHaven

client = InputHaven(api_key="your-api-key")

# Submit a form
result = client.submit("form-id", {
    "name": "John Doe",
    "email": "john@example.com"
})

# Get all forms
forms = client.get_forms()

# Get form schema
schema = client.get_form_schema("form-id")
```

## Usage Examples

### Context Manager

```python
from inputhaven import InputHaven

with InputHaven(api_key="your-api-key") as client:
    result = client.submit("contact", {"name": "John"})
    print(result.success)
```

### Async Support

```python
from inputhaven import submit_async
import asyncio

async def main():
    result = await submit_async("form-key", {"name": "John"})
    print(result.success)

asyncio.run(main())
```

### Get Templates

```python
# Get all templates
templates = client.get_templates()

# Filter by type and category
form_templates = client.get_templates(
    type="FORM_SCHEMA",
    category="contact",
    include_system=True
)

# Get specific template
template = client.get_template("template-id")
```

### Semantic Types

```python
# Get all semantic types
types = client.get_semantic_types()

# Get types for a namespace
person_types = client.get_semantic_types("person")
# Returns: person.full_name, person.email, person.phone, etc.
```

### MCP (AI Agent Integration)

```python
# Get MCP manifest
manifest = client.get_mcp_manifest()
print(manifest.tools)

# Create MCP session
session = client.create_mcp_session(
    agent_id="my-agent",
    agent_type="claude",
    capabilities=["submit", "query"]
)
```

### UFP Discovery

```python
# Discover UFP endpoints
discovery = client.discover()
print(discovery["endpoints"])
```

## API Reference

### `InputHaven` Class

```python
InputHaven(
    api_key: str,              # Required: Your API key
    base_url: str = "...",     # Optional: API base URL
    timeout: float = 30.0,     # Optional: Request timeout
    debug: bool = False        # Optional: Enable debug logging
)
```

#### Methods

| Method | Description |
|--------|-------------|
| `submit(form_id, data, **options)` | Submit data to a form |
| `submit_ufp(form_id, data, **options)` | Submit with UFP validation |
| `get_forms(page, limit, workspace_id)` | Get all forms |
| `get_form(form_id)` | Get a single form |
| `get_form_schema(form_id)` | Get form schema (UFP) |
| `get_templates(**filters)` | Get templates |
| `get_template(template_id)` | Get a template |
| `get_semantic_types(namespace)` | Get semantic types |
| `get_mcp_manifest()` | Get MCP manifest |
| `create_mcp_session(**options)` | Create MCP session |
| `discover()` | Get UFP discovery info |

### Helper Functions

```python
# Sync submission
from inputhaven import submit
result = submit("access-key", {"name": "John"})

# Async submission
from inputhaven import submit_async
result = await submit_async("access-key", {"name": "John"})
```

## Types

All response types are Pydantic models with full type hints:

```python
from inputhaven import (
    SubmissionResult,
    Form,
    FormSchema,
    UFPSchema,
    Template,
    SemanticType,
    MCPManifest,
    MCPSession,
    AIProcessingResult,
)
```

## Error Handling

```python
result = client.submit("form-id", data)

if not result.success:
    print(f"Error: {result.error.code}")
    print(f"Message: {result.error.message}")
```

## Self-Hosted

For self-hosted InputHaven instances:

```python
client = InputHaven(
    api_key="your-api-key",
    base_url="https://api.your-domain.com"
)
```

## Development

```bash
# Install dev dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Format code
black inputhaven/

# Type check
mypy inputhaven/
```

## License

MIT
