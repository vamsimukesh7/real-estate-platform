import { MessageSquare, Send, MoreVertical, Phone, Video, ArrowLeft, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const MessagesWidget = ({ activeChatUser }) => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null); // This is the user object of the person we are chatting with
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const messagesEndRef = useRef(null);

    // Initialize Socket
    useEffect(() => {
        if (!user) return;

        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to socket');
            newSocket.emit('join-room', user._id);
        });

        newSocket.on('receive-message', (message) => {
            // Update messages if we are in the chat with the sender
            // OR if we are in chat with recipient (which is us) - wait, logic check
            // If I receive a message, it's from `message.sender`.
            // If I sent a message (via another device), it's from `message.sender` (me).

            // Check if this message belongs to the current active conversation
            // The message relevant users are sender._id and recipient._id
            // One of them is me. The other one is the "chat partner".

            const otherId = message.sender._id === user._id
                ? message.recipient // if I sent it, the partner is recipient (ID or Object)
                : message.sender._id; // if they sent it, the partner is sender

            // NOTE: message.recipient might be populated or not depending on controller
            // The controller sends `fullMessage` with populated fields.
            const sentByMe = message.sender._id === user._id;
            const partnerId = sentByMe ? message.recipient._id : message.sender._id;

            if (selectedChat && selectedChat._id === partnerId) {
                setMessages(prev => [...prev, message]);
                scrollToBottom();
            }

            // Refresh conversations to update snippets/unread status
            fetchConversations();
        });

        return () => newSocket.close();
    }, [user, selectedChat]);

    // Handle initial/active chat user prop
    useEffect(() => {
        if (activeChatUser) {
            setSelectedChat(activeChatUser);
        }
    }, [activeChatUser]);

    // Fetch Conversations
    const fetchConversations = async () => {
        try {
            const { data } = await api.get('/messages/conversations');
            setConversations(data);
        } catch (error) {
            console.error('Failed to fetch conversations', error);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    // Fetch Messages when chat selected
    useEffect(() => {
        if (!selectedChat) return;

        const markAndFetch = async () => {
            try {
                // Mark as read
                await api.put(`/messages/${selectedChat._id}/read`);

                // Fetch messages
                const { data } = await api.get(`/messages/${selectedChat._id}`);
                setMessages(data);
                scrollToBottom();

                // Refresh conversations to clear unread badge locally
                fetchConversations();
            } catch (error) {
                console.error('Failed to fetch messages', error);
            }
        };

        markAndFetch();
    }, [selectedChat]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat) return;

        try {
            // Optimistic update? No, let's wait for server/socket to be safe or fast enough.
            // Actually, best practice is to await API, then append. Socket will also notify (so dedupe?)
            // If I simply await API and append, and ALSO listen to socket...
            // Standard pattern: 
            // 1. Send via API. 
            // 2. API saves and returns msg.
            // 3. We append it to our list.
            // 4. Socket *also* broadcasts. We need to optionally filter out "my own" messages from socket if we already added them.
            // OR: Don't append manually, just wait for socket. But socket is "fire and forget" sometimes.
            // Let's stick to: API response appends it. Socket event for "receive-message" checks if it's already there? 
            // EASIEST: Just append from API response. In socket listener, ignore if `sender._id === myId`.

            const { data: message } = await api.post('/messages', {
                recipientId: selectedChat._id,
                content: newMessage
            });

            setMessages(prev => [...prev, message]);
            setNewMessage('');
            scrollToBottom();
            fetchConversations(); // Update list order
        } catch (error) {
            console.error('Failed to send message', error);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-soft border border-gray-100 dark:border-dark-700 overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 dark:border-dark-700 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-dark-800 dark:to-dark-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {selectedChat ? (
                            <button
                                onClick={() => setSelectedChat(null)}
                                className="mr-2 p-1 hover:bg-white/50 rounded-full transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                            </button>
                        ) : (
                            <MessageSquare className="w-5 h-5 text-primary-600" />
                        )}
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            {selectedChat ? selectedChat.name : 'Messages'}
                        </h3>
                        {!selectedChat && conversations.length > 0 && (
                            <span className="badge badge-danger">{conversations.length}</span>
                        )}
                    </div>
                    <button className="p-1.5 hover:bg-white/50 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative flex flex-col">
                {!selectedChat ? (
                    /* Conversations List */
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {conversations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-6">
                                <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
                                <p className="text-gray-500">No messages yet</p>
                            </div>
                        ) : (
                            conversations.map((conv, index) => (
                                conv.user ? (
                                    <motion.div
                                        key={conv.user._id || index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => setSelectedChat(conv.user)}
                                        className="p-4 border-b border-gray-100 dark:border-dark-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-700 transition-all duration-200"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="relative flex-shrink-0">
                                                {conv.user.avatar ? (
                                                    <img
                                                        src={typeof conv.user.avatar === 'string' ? conv.user.avatar : conv.user.avatar.url}
                                                        alt={conv.user.name}
                                                        className="w-12 h-12 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
                                                        {conv.user.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                                                        {conv.user.name}
                                                    </h4>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                                                        {formatTime(conv.lastMessageTime)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className={`text-sm truncate flex-1 ${conv.unreadCount > 0 ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                                                        {conv.unreadCount > 0 && <span className="inline-block w-2 h-2 rounded-full bg-primary-500 mr-2 shadow-sm shadow-primary-500/50" />}
                                                        {conv.lastMessage}
                                                    </p>
                                                    {conv.unreadCount > 0 && (
                                                        <span className="ml-2 bg-primary-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center font-bold">
                                                            {conv.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : null
                            ))
                        )}
                    </div>
                ) : (
                    /* Chat Messages View */
                    <>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                            {messages.map((msg, index) => {
                                const isMe = msg.sender._id === user._id;
                                return (
                                    <div key={msg._id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${isMe
                                            ? 'bg-primary-600 text-white rounded-br-none'
                                            : 'bg-gray-100 dark:bg-dark-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                                            }`}>
                                            <p className="text-sm">{msg.content}</p>
                                            <p className={`text-[10px] mt-1 ${isMe ? 'text-primary-100' : 'text-gray-500'}`}>
                                                {formatTime(msg.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-gray-100 dark:border-dark-700 bg-gray-50 dark:bg-dark-800">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="p-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-4 h-4" />
                                </motion.button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MessagesWidget;
