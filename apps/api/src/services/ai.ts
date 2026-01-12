import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

// Spam detection using AI
export async function analyzeSpam(data: Record<string, any>): Promise<number> {
  if (!process.env.OPENAI_API_KEY) {
    return basicSpamCheck(data)
  }

  try {
    const content = Object.values(data).join(' ')
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'system',
        content: 'You are a spam detector. Rate the following form submission from 0 (not spam) to 1 (definitely spam). Only respond with a number.'
      }, {
        role: 'user',
        content: content.slice(0, 1000)
      }],
      max_tokens: 10
    })

    const score = parseFloat(response.choices[0]?.message?.content || '0')
    return isNaN(score) ? 0 : Math.min(1, Math.max(0, score))
  } catch (error) {
    console.error('AI spam analysis error:', error)
    return basicSpamCheck(data)
  }
}

// Sentiment analysis
export async function analyzeSentiment(data: Record<string, any>): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return 'neutral'
  }

  try {
    const content = Object.values(data).join(' ')
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'system',
        content: 'Analyze the sentiment of this form submission. Respond with only one word: positive, negative, or neutral.'
      }, {
        role: 'user',
        content: content.slice(0, 1000)
      }],
      max_tokens: 10
    })

    const sentiment = response.choices[0]?.message?.content?.toLowerCase().trim()
    return ['positive', 'negative', 'neutral'].includes(sentiment || '') ? sentiment! : 'neutral'
  } catch (error) {
    console.error('AI sentiment analysis error:', error)
    return 'neutral'
  }
}

// Auto-tagging
export async function generateTags(data: Record<string, any>): Promise<string[]> {
  if (!process.env.OPENAI_API_KEY) {
    return []
  }

  try {
    const content = Object.values(data).join(' ')
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'system',
        content: 'Generate 1-3 relevant tags for this form submission. Respond with comma-separated tags only, no explanation.'
      }, {
        role: 'user',
        content: content.slice(0, 1000)
      }],
      max_tokens: 50
    })

    const tags = response.choices[0]?.message?.content?.split(',').map(t => t.trim().toLowerCase()) || []
    return tags.filter(t => t.length > 0 && t.length < 30).slice(0, 5)
  } catch (error) {
    console.error('AI tag generation error:', error)
    return []
  }
}

// Generate summary
export async function generateSummary(data: Record<string, any>): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return ''
  }

  try {
    const content = Object.entries(data)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n')
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'system',
        content: 'Summarize this form submission in one sentence. Be concise and informative.'
      }, {
        role: 'user',
        content: content.slice(0, 1000)
      }],
      max_tokens: 100
    })

    return response.choices[0]?.message?.content?.trim() || ''
  } catch (error) {
    console.error('AI summary error:', error)
    return ''
  }
}

// Basic spam check without AI
function basicSpamCheck(data: Record<string, any>): number {
  const content = Object.values(data).join(' ').toLowerCase()
  let score = 0

  // Spam keywords
  const spamWords = ['viagra', 'casino', 'lottery', 'winner', 'free money', 'click here', 'buy now', 'limited time', 'act now', 'urgent']
  for (const word of spamWords) {
    if (content.includes(word)) score += 0.3
  }

  // Too many links
  const linkCount = (content.match(/https?:\/\//g) || []).length
  if (linkCount > 3) score += 0.3

  // All caps
  const capsRatio = (content.match(/[A-Z]/g) || []).length / Math.max(content.length, 1)
  if (capsRatio > 0.5) score += 0.2

  // Repeated characters
  if (/(.)\1{5,}/.test(content)) score += 0.2

  // Very short content
  if (content.length < 10) score += 0.1

  return Math.min(1, score)
}
