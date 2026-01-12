"""
InputHaven Python SDK
=====================

Official Python SDK for InputHaven - Universal Form Protocol

Quick Start:
    >>> from inputhaven import InputHaven
    >>> 
    >>> client = InputHaven(api_key="your-api-key")
    >>> result = client.submit("form-id", {"name": "John", "email": "john@example.com"})

One-liner submission:
    >>> from inputhaven import submit
    >>> submit("form-access-key", {"name": "John", "email": "john@example.com"})
"""

from .client import InputHaven, submit, submit_async
from .types import (
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

__version__ = "1.0.0"
__all__ = [
    "InputHaven",
    "submit",
    "submit_async",
    "SubmissionResult",
    "Form",
    "FormSchema",
    "UFPSchema",
    "Template",
    "SemanticType",
    "MCPManifest",
    "MCPSession",
    "AIProcessingResult",
]
