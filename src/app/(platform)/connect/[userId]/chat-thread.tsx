'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Send, Check, CheckCheck } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { sendMessage } from '@/lib/actions/messages';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils/cn';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  body: string;
  read: boolean;
  created_at: string;
}

interface OtherUser {
  id: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
}

interface Props {
  currentUserId: string;
  otherUser: OtherUser;
  initialMessages: Message[];
}

function formatDayLabel(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMMM d, yyyy');
}

function formatMessageTime(date: Date): string {
  return format(date, 'h:mm a');
}

export function ChatThread({ currentUserId, otherUser, initialMessages }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom helper — only if user is near bottom
  const scrollToBottom = useCallback((force = false) => {
    if (!scrollRef.current) return;
    if (force || isAtBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isAtBottom]);

  // Track if user is at bottom of scroll
  function handleScroll() {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setIsAtBottom(scrollHeight - scrollTop - clientHeight < 80);
  }

  // Scroll to bottom on mount (force)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'instant' });
  }, []);

  // Scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Real-time subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`chat-${currentUserId}-${otherUser.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${otherUser.id}`,
      }, (payload) => {
        const newMsg = payload.new as Message;
        if (newMsg.receiver_id === currentUserId) {
          setMessages(prev => [...prev, { ...newMsg, read: true }]);
          // Mark as read server-side
          supabase.from('messages').update({ read: true }).eq('id', newMsg.id).then();
        }
      })
      // Also watch for read status updates on our sent messages
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${currentUserId}`,
      }, (payload) => {
        const updated = payload.new as Message;
        if (updated.read) {
          setMessages(prev => prev.map(m => m.id === updated.id ? { ...m, read: true } : m));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUserId, otherUser.id]);

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setBody('');

    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      sender_id: currentUserId,
      receiver_id: otherUser.id,
      body: trimmed,
      read: false,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMsg]);
    scrollToBottom(true);

    const result = await sendMessage({ receiver_id: otherUser.id, body: trimmed });

    if (result.error) {
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      toast.error(result.error);
      setBody(trimmed); // restore
    }

    setSending(false);
    inputRef.current?.focus();
  }

  // Send on Enter (not Shift+Enter)
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Auto-resize textarea
  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setBody(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  }

  // Group messages by date
  const grouped: { date: Date; messages: Message[] }[] = [];
  for (const msg of messages) {
    const msgDate = new Date(msg.created_at);
    const lastGroup = grouped[grouped.length - 1];
    if (!lastGroup || !isSameDay(lastGroup.date, msgDate)) {
      grouped.push({ date: msgDate, messages: [msg] });
    } else {
      lastGroup.messages.push(msg);
    }
  }

  return (
    // Full viewport height minus top bar (56px) and bottom nav (64px) on mobile
    <div className="flex flex-col h-[calc(100dvh-56px-64px)] md:h-[calc(100dvh-2rem)] animate-fade-in -mx-4 md:mx-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-harbor-800 bg-white dark:bg-harbor-950 shrink-0 shadow-sm">
        <Link
          href="/connect"
          className="flex items-center justify-center h-9 w-9 rounded-lg hover:bg-gray-100 dark:hover:bg-harbor-800 transition-colors shrink-0"
          aria-label="Back to Connect"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <Avatar name={otherUser.display_name} src={otherUser.avatar_url} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-harbor-800 dark:text-white truncate leading-tight">
            {otherUser.display_name}
          </p>
          <p className="text-[11px] text-gray-500 truncate">@{otherUser.username}</p>
        </div>
      </div>

      {/* Messages scroll area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overscroll-contain px-4 py-4"
        aria-live="polite"
        aria-label="Message history"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
            <Avatar name={otherUser.display_name} src={otherUser.avatar_url} size="lg" />
            <div>
              <p className="font-semibold text-harbor-800 dark:text-white">{otherUser.display_name}</p>
              <p className="text-sm text-gray-400 mt-1">@{otherUser.username}</p>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              No messages yet. Say hello!
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {grouped.map(({ date, messages: dayMessages }, groupIdx) => (
              <div key={groupIdx}>
                {/* Date separator */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-gray-100 dark:bg-harbor-800" />
                  <span className="text-[11px] font-medium text-gray-400 shrink-0">
                    {formatDayLabel(date)}
                  </span>
                  <div className="flex-1 h-px bg-gray-100 dark:bg-harbor-800" />
                </div>

                {/* Messages in this date group */}
                {dayMessages.map((msg, msgIdx) => {
                  const isMine = msg.sender_id === currentUserId;
                  const isTemp = msg.id.startsWith('temp-');
                  const nextMsg = dayMessages[msgIdx + 1];
                  const isLastInRun = !nextMsg || nextMsg.sender_id !== msg.sender_id;
                  const prevMsg = dayMessages[msgIdx - 1];
                  const isFirstInRun = !prevMsg || prevMsg.sender_id !== msg.sender_id;

                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex items-end gap-2',
                        isMine ? 'justify-end' : 'justify-start',
                        isLastInRun ? 'mb-3' : 'mb-0.5'
                      )}
                    >
                      {/* Other user's avatar — only on last message in a run */}
                      {!isMine && (
                        <div className="w-7 shrink-0">
                          {isLastInRun && (
                            <Avatar name={otherUser.display_name} src={otherUser.avatar_url} size="sm" className="w-7 h-7 text-[10px]" />
                          )}
                        </div>
                      )}

                      <div className={cn('flex flex-col', isMine ? 'items-end' : 'items-start', 'max-w-[78%]')}>
                        {/* Bubble */}
                        <div
                          className={cn(
                            'px-3.5 py-2 text-sm leading-relaxed break-words',
                            // Shape — round all corners except the tail corner
                            isMine
                              ? cn('bg-teal-500 text-white',
                                  isFirstInRun && isLastInRun ? 'rounded-2xl' :
                                  isFirstInRun ? 'rounded-t-2xl rounded-bl-2xl rounded-br-md' :
                                  isLastInRun ? 'rounded-b-2xl rounded-tl-2xl rounded-tr-2xl rounded-br-md' :
                                  'rounded-l-2xl rounded-r-md')
                              : cn('bg-gray-100 dark:bg-harbor-800 text-harbor-800 dark:text-gray-100',
                                  isFirstInRun && isLastInRun ? 'rounded-2xl' :
                                  isFirstInRun ? 'rounded-t-2xl rounded-br-2xl rounded-bl-md' :
                                  isLastInRun ? 'rounded-b-2xl rounded-tr-2xl rounded-tl-2xl rounded-bl-md' :
                                  'rounded-r-2xl rounded-l-md')
                          )}
                        >
                          <p className="whitespace-pre-wrap">{msg.body}</p>
                        </div>

                        {/* Timestamp + read receipt — only on last message in run */}
                        {isLastInRun && (
                          <div className={cn('flex items-center gap-1 mt-1 px-1', isMine ? 'flex-row-reverse' : 'flex-row')}>
                            <span className="text-[10px] text-gray-400">
                              {formatMessageTime(new Date(msg.created_at))}
                            </span>
                            {isMine && (
                              <span className={cn('text-[10px]', msg.read ? 'text-teal-500' : 'text-gray-400')}>
                                {isTemp ? (
                                  <Check className="h-3 w-3 opacity-50" />
                                ) : msg.read ? (
                                  <CheckCheck className="h-3 w-3" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={bottomRef} className="h-1" />
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="shrink-0 px-4 py-3 border-t border-gray-100 dark:border-harbor-800 bg-white dark:bg-harbor-950 safe-area-bottom">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={body}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            aria-label="Message input"
            maxLength={2000}
            rows={1}
            inputMode="text"
            className="flex-1 resize-none rounded-2xl border border-gray-200 dark:border-harbor-700 bg-gray-50 dark:bg-harbor-900 px-4 py-2.5 text-sm text-harbor-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all min-h-[40px] max-h-[120px]"
            style={{ height: '40px' }}
            autoComplete="off"
            autoCorrect="on"
            spellCheck
          />
          <Button
            type="button"
            size="icon"
            onClick={() => handleSend()}
            disabled={!body.trim() || sending}
            aria-label="Send message"
            className={cn(
              'h-10 w-10 rounded-full shrink-0 transition-all',
              body.trim() ? 'bg-teal-500 hover:bg-teal-600 text-white shadow-md shadow-teal-500/25' : 'bg-gray-100 dark:bg-harbor-800 text-gray-400'
            )}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[10px] text-gray-300 dark:text-gray-600 text-center mt-1.5">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
