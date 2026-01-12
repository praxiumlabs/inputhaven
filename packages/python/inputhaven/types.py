"""
Type definitions for InputHaven Python SDK
"""

from typing import Optional, List, Dict, Any, Literal
from datetime import datetime
from pydantic import BaseModel, Field


class SubmissionError(BaseModel):
    """Error information from a failed submission"""
    code: str
    message: str
    details: Optional[Any] = None


class SubmissionResult(BaseModel):
    """Result of a form submission"""
    success: bool
    submission_id: Optional[str] = Field(None, alias="submissionId")
    message: Optional[str] = None
    processing_time: Optional[str] = Field(None, alias="processingTime")
    error: Optional[SubmissionError] = None

    class Config:
        populate_by_name = True


class FieldDefinition(BaseModel):
    """Definition of a form field"""
    type: Literal["string", "number", "boolean", "array", "object"] = "string"
    title: Optional[str] = None
    description: Optional[str] = None
    required: bool = False
    format: Optional[str] = None
    enum: Optional[List[str]] = None
    minimum: Optional[float] = None
    maximum: Optional[float] = None
    min_length: Optional[int] = Field(None, alias="minLength")
    max_length: Optional[int] = Field(None, alias="maxLength")
    pattern: Optional[str] = None
    semantic_type: Optional[str] = Field(None, alias="semanticType")
    default: Optional[Any] = None

    class Config:
        populate_by_name = True


class FormSchema(BaseModel):
    """Schema definition for a form"""
    fields: Dict[str, FieldDefinition]
    required: Optional[List[str]] = None


class Form(BaseModel):
    """Form object"""
    id: str
    name: str
    description: Optional[str] = None
    access_key: str = Field(alias="accessKey")
    schema_: Optional[FormSchema] = Field(None, alias="schema")
    is_active: bool = Field(True, alias="isActive")
    submission_count: int = Field(0, alias="submissionCount")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")

    class Config:
        populate_by_name = True


class UFPValidation(BaseModel):
    """Validation rules for a UFP field"""
    format: Optional[str] = None
    pattern: Optional[str] = None
    min: Optional[float] = None
    max: Optional[float] = None
    min_length: Optional[int] = Field(None, alias="minLength")
    max_length: Optional[int] = Field(None, alias="maxLength")
    enum: Optional[List[str]] = None

    class Config:
        populate_by_name = True


class UFPField(BaseModel):
    """Field definition in UFP format"""
    name: str
    type: str
    title: str
    description: Optional[str] = None
    required: bool = False
    semantic_type: Optional[str] = Field(None, alias="semantic_type")
    validation: Optional[UFPValidation] = None
    ai_hints: Optional[Dict[str, Any]] = Field(None, alias="ai_hints")

    class Config:
        populate_by_name = True


class UFPCapabilities(BaseModel):
    """Capabilities of a UFP form"""
    ai_processing: bool = Field(alias="ai_processing")
    file_upload: bool = Field(alias="file_upload")
    webhooks: bool
    auto_response: bool = Field(alias="auto_response")

    class Config:
        populate_by_name = True


class UFPSchema(BaseModel):
    """UFP Schema for a form"""
    ufp_version: str
    form_id: str
    form_name: str
    description: Optional[str] = None
    fields: List[UFPField]
    submission_url: str
    capabilities: UFPCapabilities

    class Config:
        populate_by_name = True


class Template(BaseModel):
    """Template object"""
    id: str
    name: str
    slug: str
    type: str
    category: Optional[str] = None
    description: Optional[str] = None
    schema_: Optional[Dict[str, Any]] = Field(None, alias="schema")
    is_system: bool = Field(False, alias="isSystem")
    is_public: bool = Field(False, alias="isPublic")
    is_published: bool = Field(False, alias="isPublished")
    version: int = 1
    ai_enabled: bool = Field(True, alias="aiEnabled")
    mcp_enabled: bool = Field(True, alias="mcpEnabled")
    usage_count: int = Field(0, alias="usageCount")
    created_at: Optional[datetime] = Field(None, alias="createdAt")
    updated_at: Optional[datetime] = Field(None, alias="updatedAt")

    class Config:
        populate_by_name = True


class SemanticType(BaseModel):
    """Semantic type definition"""
    namespace: str
    name: str
    full_path: str = Field(alias="fullPath")
    description: str
    examples: List[str]
    json_schema_type: Optional[str] = Field(None, alias="jsonSchemaType")
    schema_org_type: Optional[str] = Field(None, alias="schemaOrgType")
    open_api_format: Optional[str] = Field(None, alias="openApiFormat")

    class Config:
        populate_by_name = True


class MCPTool(BaseModel):
    """MCP Tool definition"""
    name: str
    description: str
    input_schema: Dict[str, Any] = Field(alias="inputSchema")

    class Config:
        populate_by_name = True


class MCPResource(BaseModel):
    """MCP Resource definition"""
    uri: str
    name: str
    description: str
    mime_type: str = Field(alias="mimeType")

    class Config:
        populate_by_name = True


class MCPCapabilities(BaseModel):
    """MCP Server capabilities"""
    tools: bool = True
    resources: bool = True
    prompts: bool = True


class MCPManifest(BaseModel):
    """MCP Manifest for AI agent discovery"""
    name: str
    version: str
    protocol_version: str
    capabilities: MCPCapabilities
    tools: List[MCPTool]
    resources: List[MCPResource]


class MCPSession(BaseModel):
    """MCP Session for AI agents"""
    session_token: str = Field(alias="sessionToken")
    agent_id: Optional[str] = Field(None, alias="agentId")
    agent_type: Optional[str] = Field(None, alias="agentType")
    capabilities: List[str]
    expires_at: datetime = Field(alias="expiresAt")

    class Config:
        populate_by_name = True


class ExtractedEntities(BaseModel):
    """Entities extracted by AI processing"""
    names: Optional[List[str]] = None
    emails: Optional[List[str]] = None
    phones: Optional[List[str]] = None
    companies: Optional[List[str]] = None
    dates: Optional[List[str]] = None
    money: Optional[List[str]] = None
    urls: Optional[List[str]] = None
    custom: Optional[Dict[str, Any]] = None


class AIProcessingResult(BaseModel):
    """Result of AI processing on a submission"""
    classification: Optional[str] = None
    sentiment: Optional[Literal["positive", "negative", "neutral", "frustrated", "urgent"]] = None
    summary: Optional[str] = None
    tags: Optional[List[str]] = None
    entities: Optional[ExtractedEntities] = None
    confidence: Optional[float] = None
    processing_time: Optional[int] = Field(None, alias="processingTime")

    class Config:
        populate_by_name = True
