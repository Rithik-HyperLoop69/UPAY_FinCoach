import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Sparkles,
  Send,
  ShieldCheck,
  Bot,
  User,
  Info,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { api } from '../api/client';
import { formatBDT } from '../utils/formatters';

interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  observed?: string;
  forecast?: string;
  suggestion?: string;
  provider?: string;
}

export const AICoachPage: React.FC = () => {
  const location = useLocation();
  const initialPrompt = (location.state as any)?.initialPrompt || '';

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I am your **UPAY FinCoach**. I analyze your transaction habits, forecast future liquidity, and help you grow your savings with disciplined guidance.

How can I help you understand your money today?`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState(initialPrompt);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [contextPreview, setContextPreview] = useState<any>(null);
  const [showContextSidebar, setShowContextSidebar] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load context preview to show the user what data the AI sees
    api.get('/coach/context-preview').then(setContextPreview).catch(() => {});

    if (initialPrompt) {
      handleSend(initialPrompt);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res: any = await api.post('/coach/chat', {
        message: textToSend,
        conversationId,
      });

      setConversationId(res.conversationId);
      const assistantMsg: Message = {
        role: 'assistant',
        content: res.message,
        observed: res.observed,
        forecast: res.forecast,
        suggestion: res.suggestion,
        provider: res.provider,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ I encountered an error accessing your financial context. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    'How much did I spend this month?',
    'Where am I spending the most?',
    'Can I save more next month?',
    'What could cause a cash shortage next month?',
    'How close am I to my savings goal?',
    'What does my cash-flow forecast look like?',
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6">
      {/* Main Chat Stream */}
      <div className="flex-1 flex flex-col glass-panel rounded-3xl overflow-hidden border border-slate-800">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm">upay FinCoach AI</h3>
                <Badge variant="emerald" size="sm">
                  Active
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400">
                Grounded in your authenticated transaction records
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowContextSidebar(!showContextSidebar)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs flex items-center gap-1.5 transition-colors"
          >
            <Info className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Inspect AI Context</span>
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-gradient-to-tr from-teal-500 to-blue-600 text-white'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-200'
                }`}
              >
                {/* Render assistant structured breakdown if present */}
                {msg.observed && (
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300">
                      <span className="font-bold text-teal-300 flex items-center gap-1 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Observed Facts:
                      </span>
                      <p>{msg.observed}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/50 text-slate-300">
                      <span className="font-bold text-blue-300 flex items-center gap-1 mb-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Cash-Flow Forecast:
                      </span>
                      <p>{msg.forecast}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-900/50 text-slate-300">
                      <span className="font-bold text-emerald-300 flex items-center gap-1 mb-1">
                        <Lightbulb className="w-3.5 h-3.5" />
                        Actionable Suggestion:
                      </span>
                      <p>{msg.suggestion}</p>
                    </div>
                  </div>
                )}

                {/* Plain Markdown/Text rendering */}
                {!msg.observed && (
                  <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-400 animate-pulse">
                Analyzing recent cash flow and synthesizing coaching recommendations...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Chips Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 flex items-center gap-2 overflow-x-auto">
          {samplePrompts.map((p) => (
            <button
              key={p}
              onClick={() => handleSend(p)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-white whitespace-nowrap transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything about your income, spending, budget, or forecast..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
            />
            <Button
              type="submit"
              variant="upay"
              size="md"
              disabled={isLoading || !inputMessage.trim()}
              rightIcon={<Send className="w-4 h-4" />}
            >
              Ask
            </Button>
          </form>
        </div>
      </div>

      {/* Context Inspector Sidebar */}
      {showContextSidebar && (
        <div className="w-full lg:w-80 glass-panel rounded-3xl p-5 border border-slate-800 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              AI Context Snapshot
            </span>
            <button
              onClick={() => setShowContextSidebar(false)}
              className="text-xs text-slate-500 hover:text-white"
            >
              Close
            </button>
          </div>

          <p className="text-[11px] text-slate-400 leading-normal">
            For maximum privacy and anti-hallucination, the AI does not query your database
            directly. It only receives this sanitized snapshot:
          </p>

          {contextPreview && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Monthly Income / Expense</span>
                <span className="font-mono font-bold text-white">
                  {formatBDT(contextPreview.monthlyIncome)} / {formatBDT(contextPreview.monthlyExpenses)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Health Score</span>
                <span className="font-mono font-bold text-emerald-400">
                  {contextPreview.financialHealthScore}/100 ({contextPreview.healthTier})
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Top Spending Areas</span>
                <ul className="mt-1 space-y-1 text-slate-300">
                  {contextPreview.topSpendingCategories.map((c: any) => (
                    <li key={c.category} className="flex justify-between">
                      <span>{c.category}</span>
                      <span className="font-mono font-semibold">{formatBDT(c.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">30-Day Forecast Net</span>
                <span className="font-mono font-bold text-teal-300">
                  +{formatBDT(contextPreview.forecast.projectedNetCashFlow)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
