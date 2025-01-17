import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { messages, responseRate, topic } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error('Messages are required and must be a non-empty array')
    }

    if (!topic) {
      throw new Error('Topic is required')
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set')
    }

    const systemPrompt = `You are an AI moderator in a group chat discussing the topic: "${topic}". Your role is to facilitate discussion, ensure fair and respectful conversation, and provide guidance when needed. Your response rate is set to ${responseRate} (low: respond every 5 minutes, high: respond every 1 minute). Adjust your responses accordingly:

1. Reengage participants if the discussion is stalling
2. Recap important points periodically
3. Mediate when participants seem frustrated or if the conversation becomes unproductive
4. Ask thought-provoking questions to deepen the discussion
5. Ensure all participants have an opportunity to contribute
6. Keep the conversation focused on the main topic

Use your best judgment to maintain a balanced and productive conversation while adhering to the specified response rate. You may also be manually triggered to respond at any time, so be prepared to provide timely and relevant input regardless of the usual response interval.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-10) // Only send the last 10 messages to stay within token limits
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const aiResponse = data.choices[0].message.content

    if (!aiResponse) {
      throw new Error('No response received from OpenAI')
    }

    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    console.error('Error in API route:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        details: error instanceof Error ? error.stack : 'No stack trace available'
      },
      { status: 500 }
    )
  }
}

