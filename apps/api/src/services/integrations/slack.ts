/**
 * Slack Integration Connector
 */

import type { SlackConfig, IntegrationPayload, IntegrationResult } from './types.js'

export async function sendToSlack(
  integrationId: string,
  config: SlackConfig,
  payload: IntegrationPayload
): Promise<IntegrationResult> {
  const startTime = Date.now()

  try {
    // Build Slack message
    const message = buildSlackMessage(config, payload)

    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message),
      signal: AbortSignal.timeout(10000)
    })

    const duration = Date.now() - startTime
    const responseText = await response.text()

    if (!response.ok) {
      return {
        success: false,
        integrationId,
        integrationType: 'slack',
        responseCode: response.status,
        responseBody: responseText,
        error: `Slack API error: ${response.status}`,
        duration
      }
    }

    return {
      success: true,
      integrationId,
      integrationType: 'slack',
      responseCode: response.status,
      responseBody: responseText,
      duration
    }
  } catch (error) {
    return {
      success: false,
      integrationId,
      integrationType: 'slack',
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    }
  }
}

function buildSlackMessage(config: SlackConfig, payload: IntegrationPayload): Record<string, unknown> {
  // Format submission data as fields
  const fields = Object.entries(payload.data)
    .filter(([key]) => !key.startsWith('_'))
    .map(([key, value]) => ({
      title: formatFieldName(key),
      value: String(value || ''),
      short: String(value || '').length < 40
    }))

  // Build blocks for rich formatting
  const blocks: unknown[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `📥 New Submission: ${payload.formName}`,
        emoji: true
      }
    },
    {
      type: 'section',
      fields: fields.slice(0, 10).map(f => ({
        type: 'mrkdwn',
        text: `*${f.title}*\n${f.value || '_empty_'}`
      }))
    }
  ]

  // Add AI insights if available
  if (payload.ai?.summary || payload.ai?.sentiment) {
    blocks.push({
      type: 'divider'
    })
    blocks.push({
      type: 'context',
      elements: [
        ...(payload.ai.summary ? [{
          type: 'mrkdwn',
          text: `📝 *Summary:* ${payload.ai.summary}`
        }] : []),
        ...(payload.ai.sentiment ? [{
          type: 'mrkdwn',
          text: `🎭 *Sentiment:* ${payload.ai.sentiment}`
        }] : []),
        ...(payload.ai.classification ? [{
          type: 'mrkdwn',
          text: `🏷️ *Type:* ${payload.ai.classification}`
        }] : [])
      ]
    })
  }

  // Add timestamp
  blocks.push({
    type: 'context',
    elements: [{
      type: 'mrkdwn',
      text: `Submitted at ${payload.metadata?.timestamp || new Date().toISOString()}`
    }]
  })

  return {
    username: config.username || 'InputHaven',
    icon_emoji: config.iconEmoji || ':inbox_tray:',
    channel: config.channel,
    blocks,
    // Fallback text for notifications
    text: `New submission on ${payload.formName}`
  }
}

function formatFieldName(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}
