import React, { useState, useEffect, useRef } from 'react';
import Button from '../ui/Button';
import { Card } from '../ui/index.jsx';

const WatchChat = ({ squadId, user, isActive = true }) => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      user: 'Sarah',
      message: 'This movie is amazing! 🍿',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      type: 'message'
    },
    {
      id: '2',
      user: 'Mike',
      message: 'Just joined! What did I miss?',
      timestamp: new Date(Date.now() - 240000).toISOString(),
      type: 'message'
    },
    {
      id: '3',
      user: 'System',
      message: 'Sarah reacted with 😂',
      timestamp: new Date(Date.now() - 180000).toISOString(),
      type: 'reaction'
    },
    {
      id: '4',
      user: 'You',
      message: 'The cinematography is incredible!',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      type: 'message'
    },
    {
      id: '5',
      user: 'System',
      message: 'Mike reacted with 🤯',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      type: 'reaction'
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [showReactions, setShowReactions] = useState(false);
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  const reactions = ['❤️', '😂', '😮', '😢', '😡', '👍', '👎', '🔥', '🤯', '🍿'];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      user: user?.username || 'You',
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'message'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    chatInputRef.current?.focus();
  };

  const handleReaction = (emoji) => {
    const reactionMessage = {
      id: Date.now().toString(),
      user: 'System',
      message: `${user?.username || 'You'} reacted with ${emoji}`,
      timestamp: new Date().toISOString(),
      type: 'reaction'
    };

    setMessages(prev => [...prev, reactionMessage]);
    setShowReactions(false);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
  };

  const getMessageStyle = (messageUser, type) => {
    if (type === 'reaction') {
      return 'bg-blue-500 bg-opacity-20 text-blue-300 text-sm italic';
    }
    
    if (messageUser === user?.username || messageUser === 'You') {
      return 'bg-blue-600 text-white ml-8';
    }
    
    return 'bg-gray-600 text-white mr-8';
  };

  if (!isActive) {
    return (
      <Card className="p-6 bg-gray-700 border-gray-600 text-center">
        <div className="text-4xl mb-3">💬</div>
        <h4 className="text-white font-medium mb-2">Chat Unavailable</h4>
        <p className="text-gray-400 text-sm">
          Join the squad and start watching to participate in chat
        </p>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-700 border-gray-600 flex flex-col h-80">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-600 flex items-center justify-between">
        <h3 className="text-white font-medium">Squad Chat</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-400">Live</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col">
            <div className={`rounded-lg p-3 max-w-xs break-words ${getMessageStyle(msg.user, msg.type)}`}>
              {msg.type === 'message' && (
                <div className="text-xs opacity-75 mb-1">
                  {msg.user}
                </div>
              )}
              <div className={msg.type === 'reaction' ? 'text-center' : ''}>
                {msg.message}
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1 text-right">
              {formatTime(msg.timestamp)}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reactions */}
      {showReactions && (
        <div className="p-3 border-t border-gray-600 bg-gray-800">
          <div className="grid grid-cols-5 gap-2">
            {reactions.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="text-2xl p-2 rounded hover:bg-gray-600 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-gray-600 bg-gray-800">
        <div className="flex items-center space-x-2">
          <div className="flex-1 flex space-x-2">
            <input
              ref={chatInputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              maxLength={500}
            />
            <Button
              onClick={() => setShowReactions(!showReactions)}
              variant="outline"
              size="sm"
              className="px-3 py-2 text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-gray-900"
            >
              😀
            </Button>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
          >
            Send
          </Button>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
          <span>Press Enter to send</span>
          <span>{newMessage.length}/500</span>
        </div>
      </div>
    </Card>
  );
};

export default WatchChat;
