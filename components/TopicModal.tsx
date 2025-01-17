import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"

interface TopicModalProps {
  isOpen: boolean;
  onClose: (topic: string) => void;
}

export function TopicModal({ isOpen, onClose }: TopicModalProps) {
  const [topic, setTopic] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (topic.trim()) {
      onClose(topic.trim())
    }
  }

  return (
    <Dialog open={isOpen}>
      <DialogContent aria-describedby="topic-description">
        <DialogHeader>
          <DialogTitle>Set Discussion Topic</DialogTitle>
          <DialogDescription id="topic-description">
            Enter a topic for the AI moderator to focus on during the discussion.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter the topic for discussion"
            className="mb-4"
          />
          <DialogFooter>
            <Button type="submit" disabled={!topic.trim()}>
              Start Chat
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

