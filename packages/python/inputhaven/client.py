"""
InputHaven Python Client
"""

import httpx
from typing import Optional, Dict, Any, List
from .types import (
    SubmissionResult,
    SubmissionError,
    Form,
    UFPSchema,
    Template,
    SemanticType,
    MCPManifest,
    MCPSession,
)

DEFAULT_BASE_URL = "https://api.inputhaven.com"
DEFAULT_TIMEOUT = 30.0


class InputHaven:
    """
    InputHaven API Client
    
    Example:
        >>> client = InputHaven(api_key="your-api-key")
        >>> result = client.submit("form-id", {"name": "John", "email": "john@example.com"})
        >>> if result.success:
        ...     print(f"Submitted: {result.submission_id}")
    """

    def __init__(
        self,
        api_key: str,
        base_url: str = DEFAULT_BASE_URL,
        timeout: float = DEFAULT_TIMEOUT,
        debug: bool = False,
    ):
        """
        Initialize the InputHaven client.
        
        Args:
            api_key: Your InputHaven API key
            base_url: API base URL (default: https://api.inputhaven.com)
            timeout: Request timeout in seconds (default: 30)
            debug: Enable debug logging
        """
        if not api_key:
            raise ValueError("api_key is required")

        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.debug = debug
        
        self._client = httpx.Client(
            base_url=self.base_url,
            timeout=timeout,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "User-Agent": "inputhaven-python/1.0.0",
            },
        )

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()

    def close(self):
        """Close the HTTP client."""
        self._client.close()

    # ==================== SUBMISSIONS ====================

    def submit(
        self,
        form_id: str,
        data: Dict[str, Any],
        *,
        skip_spam_check: bool = False,
        skip_ai_processing: bool = False,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> SubmissionResult:
        """
        Submit data to a form.
        
        Args:
            form_id: Form ID or access key
            data: Form data to submit
            skip_spam_check: Skip spam detection
            skip_ai_processing: Skip AI processing
            metadata: Additional metadata
            
        Returns:
            SubmissionResult with success status and submission ID
            
        Example:
            >>> result = client.submit("contact-form", {
            ...     "name": "John Doe",
            ...     "email": "john@example.com",
            ...     "message": "Hello!"
            ... })
        """
        payload = {
            "access_key": form_id,
            **data,
            "_meta": {
                "sdk": "inputhaven-python",
                "version": "1.0.0",
                "skipSpamCheck": skip_spam_check,
                "skipAiProcessing": skip_ai_processing,
                **(metadata or {}),
            },
        }

        try:
            response = self._client.post("/v1/submit", json=payload)
            response.raise_for_status()
            return SubmissionResult(**response.json())
        except httpx.HTTPStatusError as e:
            error_data = e.response.json() if e.response.content else {}
            return SubmissionResult(
                success=False,
                error=SubmissionError(
                    code=f"HTTP_{e.response.status_code}",
                    message=error_data.get("error", {}).get("message", str(e)),
                ),
            )
        except Exception as e:
            return SubmissionResult(
                success=False,
                error=SubmissionError(code="ERROR", message=str(e)),
            )

    def submit_ufp(
        self,
        form_id: str,
        data: Dict[str, Any],
        **options,
    ) -> SubmissionResult:
        """
        Submit using UFP protocol with schema validation.
        
        Args:
            form_id: Form ID
            data: Form data
            **options: Additional submission options
        """
        payload = {"form_id": form_id, "data": data, **options}
        
        try:
            response = self._client.post("/v1/ufp/submit", json=payload)
            response.raise_for_status()
            return SubmissionResult(**response.json())
        except Exception as e:
            return SubmissionResult(
                success=False,
                error=SubmissionError(code="ERROR", message=str(e)),
            )

    # ==================== FORMS ====================

    def get_forms(
        self,
        page: int = 1,
        limit: int = 20,
        workspace_id: Optional[str] = None,
    ) -> List[Form]:
        """
        Get all forms in workspace.
        
        Args:
            page: Page number
            limit: Items per page
            workspace_id: Filter by workspace
        """
        params = {"page": page, "limit": limit}
        if workspace_id:
            params["workspaceId"] = workspace_id

        response = self._client.get("/v1/forms", params=params)
        response.raise_for_status()
        data = response.json()
        
        if data.get("success"):
            return [Form(**f) for f in data.get("data", [])]
        return []

    def get_form(self, form_id: str) -> Optional[Form]:
        """
        Get a single form by ID.
        
        Args:
            form_id: Form ID
        """
        response = self._client.get(f"/v1/forms/{form_id}")
        if response.status_code == 404:
            return None
        response.raise_for_status()
        data = response.json()
        
        if data.get("success"):
            return Form(**data["data"])
        return None

    def get_form_schema(self, form_id: str) -> Optional[UFPSchema]:
        """
        Get form schema in UFP format.
        
        Args:
            form_id: Form ID
        """
        try:
            response = self._client.get(f"/v1/ufp/forms/{form_id}/schema")
            response.raise_for_status()
            data = response.json()
            
            if data.get("success"):
                return UFPSchema(**data["data"])
        except Exception:
            pass
        return None

    # ==================== TEMPLATES ====================

    def get_templates(
        self,
        *,
        type: Optional[str] = None,
        category: Optional[str] = None,
        include_system: bool = True,
        include_public: bool = True,
    ) -> List[Template]:
        """
        Get available templates.
        
        Args:
            type: Filter by template type
            category: Filter by category
            include_system: Include system templates
            include_public: Include public templates
        """
        params = {}
        if type:
            params["type"] = type
        if category:
            params["category"] = category
        if include_system:
            params["includeSystem"] = "true"
        if include_public:
            params["includePublic"] = "true"

        response = self._client.get("/v1/templates", params=params)
        response.raise_for_status()
        data = response.json()
        
        if data.get("success"):
            return [Template(**t) for t in data.get("data", [])]
        return []

    def get_template(self, template_id: str) -> Optional[Template]:
        """
        Get a template by ID.
        
        Args:
            template_id: Template ID
        """
        response = self._client.get(f"/v1/templates/{template_id}")
        if response.status_code == 404:
            return None
        response.raise_for_status()
        data = response.json()
        
        if data.get("success"):
            return Template(**data["data"])
        return None

    # ==================== SEMANTIC TYPES ====================

    def get_semantic_types(self, namespace: Optional[str] = None) -> List[SemanticType]:
        """
        Get semantic types.
        
        Args:
            namespace: Filter by namespace (e.g., "person", "organization")
        """
        path = f"/v1/ufp/types/{namespace}" if namespace else "/v1/ufp/types"
        response = self._client.get(path)
        response.raise_for_status()
        data = response.json()
        
        if data.get("success"):
            return [SemanticType(**t) for t in data.get("data", [])]
        return []

    # ==================== MCP ====================

    def get_mcp_manifest(self) -> Optional[MCPManifest]:
        """
        Get MCP manifest for AI agent discovery.
        """
        try:
            # MCP manifest doesn't require auth
            response = httpx.get(
                f"{self.base_url}/mcp/v1/manifest",
                timeout=self.timeout,
            )
            response.raise_for_status()
            return MCPManifest(**response.json())
        except Exception:
            return None

    def create_mcp_session(
        self,
        *,
        agent_id: Optional[str] = None,
        agent_type: Optional[str] = None,
        capabilities: Optional[List[str]] = None,
    ) -> Optional[MCPSession]:
        """
        Create MCP session for AI agent.
        
        Args:
            agent_id: Agent identifier
            agent_type: Agent type (e.g., "claude", "gpt")
            capabilities: Requested capabilities
        """
        payload = {}
        if agent_id:
            payload["agentId"] = agent_id
        if agent_type:
            payload["agentType"] = agent_type
        if capabilities:
            payload["capabilities"] = capabilities

        response = self._client.post("/mcp/v1/sessions", json=payload)
        response.raise_for_status()
        data = response.json()
        
        if data.get("success"):
            return MCPSession(**data["data"])
        return None

    # ==================== DISCOVERY ====================

    def discover(self) -> Dict[str, Any]:
        """
        Get UFP discovery information.
        """
        response = httpx.get(
            f"{self.base_url}/.well-known/ufp.json",
            timeout=self.timeout,
        )
        response.raise_for_status()
        return response.json()


# ==================== HELPER FUNCTIONS ====================

def submit(
    access_key: str,
    data: Dict[str, Any],
    *,
    base_url: str = DEFAULT_BASE_URL,
    timeout: float = DEFAULT_TIMEOUT,
) -> SubmissionResult:
    """
    Quick one-liner form submission (no API key required).
    
    Args:
        access_key: Form access key
        data: Form data to submit
        base_url: API base URL
        timeout: Request timeout
        
    Example:
        >>> from inputhaven import submit
        >>> result = submit("form-access-key", {"name": "John", "email": "john@test.com"})
    """
    try:
        response = httpx.post(
            f"{base_url}/v1/submit",
            json={"access_key": access_key, **data},
            headers={
                "Content-Type": "application/json",
                "User-Agent": "inputhaven-python/1.0.0",
            },
            timeout=timeout,
        )
        response.raise_for_status()
        return SubmissionResult(**response.json())
    except Exception as e:
        return SubmissionResult(
            success=False,
            error=SubmissionError(code="ERROR", message=str(e)),
        )


async def submit_async(
    access_key: str,
    data: Dict[str, Any],
    *,
    base_url: str = DEFAULT_BASE_URL,
    timeout: float = DEFAULT_TIMEOUT,
) -> SubmissionResult:
    """
    Async one-liner form submission.
    
    Args:
        access_key: Form access key
        data: Form data to submit
        base_url: API base URL
        timeout: Request timeout
        
    Example:
        >>> from inputhaven import submit_async
        >>> result = await submit_async("form-access-key", {"name": "John"})
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{base_url}/v1/submit",
                json={"access_key": access_key, **data},
                headers={
                    "Content-Type": "application/json",
                    "User-Agent": "inputhaven-python/1.0.0",
                },
                timeout=timeout,
            )
            response.raise_for_status()
            return SubmissionResult(**response.json())
    except Exception as e:
        return SubmissionResult(
            success=False,
            error=SubmissionError(code="ERROR", message=str(e)),
        )
