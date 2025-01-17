'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'
import { TopicModal } from '@/components/TopicModal'

export default function ModeratorChat() {
  const [messages, setMessages] = useState<{ role: string; content: string; timestamp: number }[]>([])
  const [input, setInput] = useState('')
  const [isHighRate, setIsHighRate] = useState(false)
  const [isModeratorOn, setIsModeratorOn] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [topic, setTopic] = useState<string | null>(null)
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastModeratorResponseTime = useRef<number>(0)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isModeratorOn && topic) {
      interval = setInterval(() => {
        const currentTime = Date.now()
        const timeSinceLastResponse = currentTime - lastModeratorResponseTime.current
        const responseInterval = isHighRate ? 60000 : 300000 // 1 minute or 5 minutes

        if (timeSinceLastResponse >= responseInterval && messages.length > 0) {
          handleModeratorResponse()
        }
      }, 10000) // Check every 10 seconds
    }

    return () => clearInterval(interval)
  }, [isHighRate, messages, isModeratorOn, topic])

  const handleModeratorResponse = async () => {
    if (!topic) return;
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages, responseRate: isHighRate ? 'high' : 'low', topic }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'An error occurred while fetching the response.')
      }

      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: data.response, timestamp: Date.now() }])
      lastModeratorResponseTime.current = Date.now()
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !topic) return

    const newMessage = { role: 'user', content: input, timestamp: Date.now() }
    setMessages(prevMessages => [...prevMessages, newMessage])
    setInput('')

    if (isModeratorOn && messages.length === 0) {
      // Trigger an immediate moderator response for the first message when moderator is on
      await handleModeratorResponse()
    }
  }

  const handleManualTrigger = () => {
    if (!isLoading && messages.length > 0 && topic) {
      handleModeratorResponse()
    }
  }

  const handleTopicSet = (newTopic: string) => {
    setTopic(newTopic)
    setIsTopicModalOpen(false)
  }

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI Moderator Chat</h1>
      {topic && (
        <div className="mb-4 p-2 bg-blue-100 rounded">
          <strong>Current Topic:</strong> {topic}
        </div>
      )}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="moderator-toggle"
            checked={isModeratorOn}
            onCheckedChange={setIsModeratorOn}
          />
          <label htmlFor="moderator-toggle" className="text-sm font-medium text-gray-700">
            Moderator {isModeratorOn ? 'On' : 'Off'}
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="response-rate"
            checked={isHighRate}
            onCheckedChange={setIsHighRate}
            disabled={!isModeratorOn}
          />
          <label htmlFor="response-rate" className="text-sm font-medium text-gray-700">
            {isHighRate ? 'High Rate (1 min)' : 'Low Rate (5 min)'}
          </label>
        </div>
        <Button onClick={handleManualTrigger} disabled={isLoading || messages.length === 0 || !topic}>
          Trigger Moderator
        </Button>
      </div>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((m, index) => (
          <div key={index} className={`p-2 rounded ${
            m.role === 'user' 
              ? 'bg-blue-100 ml-auto' 
              : m.role === 'assistant' 
                ? 'bg-green-100' 
                : 'bg-gray-100'
          } max-w-[80%]`}>
            <p>{m.content}</p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(m.timestamp).toLocaleTimeString()}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
          disabled={!topic}
        />
        <Button type="submit" disabled={isLoading || !topic}>
          Send
        </Button>
      </form>
      <TopicModal isOpen={isTopicModalOpen} onClose={handleTopicSet} />
    </div>
  )
}

