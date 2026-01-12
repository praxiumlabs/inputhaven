/**
 * Discord Integration Connector
 */

import type { DiscordConfig, IntegrationPayload, IntegrationResult } from './types.js'

export async function sendToDiscord(
  integrationId: string,
  config: DiscordConfig,
  payload: IntegrationPayload
): Promise<IntegrationResult> {
  const startTime = Date.now()

  try {
    const message = buildDiscordMessage(config, payload)

    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message),
      signal: AbortSignal.timeout(10000)
    })

    const duration = Date.now() - startTime

    // Discord returns 204 No Content on success
    if (response.status === 204 || response.ok) {
      return {
        success: true,
        integrationId,
        integrationType: 'discord',
        responseCode: response.status,
        duration
      }
    }

    const responseText = await response.text()
    return {
      success: false,
      integrationId,
      integrationType: 'discord',
      responseCode: response.status,
      responseBody: responseText,
      error: `Discord API error: ${response.status}`,
      duration
    }
  } catch (error) {
    return {
      success: false,
      integrationId,
      integrationType: 'discord',
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    }
  }
}

function buildDiscordMessage(config: DiscordConfig, payload: IntegrationPayload): Record<string, unknown> {
  // Parse embed color
  const embedColor = config.embedColor || parseColor('#6366f1')

  // Build fields from submission data
  const fields = Object.entries(payload.data)
    .filter(([key]) => !key.startsWith('_'))
    .slice(0, 25) // Discord limit
    .map(([key, value]) => ({
      name: formatFieldName(key),
      value: truncate(String(value || '_empty_'), 1024),
      inline: String(value || '').length < 40
    }))

  // Build embed
  const embed: Record<string, unknown> = {
    title: `📥 New Submission: ${payload.formName}`,
    color: embedColor,
    fields,
    timestamp: payload.metadata?.timestamp || new Date().toISOString(),
    footer: {
      text: 'InputHaven',
      icon_url: 'https://inputhaven.com/logo.png'
    }
  }

  // Add AI insights as description
  if (payload.ai?.summary || payload.ai?.sentiment || payload.ai?.classification) {
    const insights: string[] = []
    if (payload.ai.summary) insights.push(`📝 **Summary:** ${payload.ai.summary}`)
    if (payload.ai.sentiment) insights.push(`🎭 **Sentiment:** ${payload.ai.sentiment}`)
    if (payload.ai.classification) insights.push(`🏷️ **Type:** ${payload.ai.classification}`)
    if (payload.ai.tags?.length) insights.push(`🔖 **Tags:** ${payload.ai.tags.join(', ')}`)
    
    embed.description = insights.join('\n')
  }

  return {
    username: config.username || 'InputHaven',
    avatar_url: config.avatarUrl || 'https://inputhaven.com/logo.png',
    embeds: [embed]
  }
}

function formatFieldName(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

function parseColor(color: string): number {
  // Convert hex color to integer
  if (color.startsWith('#')) {
    return parseInt(color.slice(1), 16)
  }
  return parseInt(color, 16) || 0x6366f1
}
