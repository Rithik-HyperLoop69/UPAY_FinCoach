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
  Cpu,
  Lock,
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ModelCardsModal } from '../components/ModelCardsModal';
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
  privacyMetadata?: {
    mode?: string;
    provider?: string;
    thirdPartyBytesSent?: number;
    privacyGuarantee?: string;
  };
}

export const AICoachPage: React.FC = () => {
  const location = useLocation();
  const initialPrompt = (location.state as any)?.initialPrompt || '';

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I am your **upay FinCoach**. I translate verified statistical cash-flow projections and anomaly models into plain, disciplined financial guidance.

How can I help you understand your cash-flow and savings trajectory today?`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState(initialPrompt);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [privacyMode, setPrivacyMode] = useState<'cloud' | 'local_airgap'>('cloud');
  const [isLoading, setIsLoading] = useState(false);
  const [contextPreview, setContextPreview] = useState<any>(null);
  const [showContextSidebar, setShowContextSidebar] = useState(false);
  const [showModelCards, setShowModelCards] = useState(false);

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
        privacyMode,
      });

      setConversationId(res.conversationId);
      const assistantMsg: Message = {
        role: 'assistant',
        content: res.message,
        observed: res.observed,
        forecast: res.forecast,
        suggestion: res.suggestion,
        provider: res.provider,
        privacyMetadata: res.privacyMetadata,
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
    'Do you detect any spending anomalies or spikes?',
    'Explain my P10 to P90 forecast range and shortfall risk.',
    'What are my 6 financial wellness pillar scores?',
    'Where am I spending the most this month?',
    'Can I safely save more next month?',
    'What could cause a cash shortage next month?',
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6">
      {/* Main Chat Stream */}
      <div className="flex-1 flex flex-col glass-panel rounded-3xl overflow-hidden border border-slate-800">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-white text-sm">upay FinCoach AI</h3>
                <Badge variant="emerald" size="sm">
                  Grounded in Holt-Winters ML
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400">
                Proprietary Statistical Models + Gemini 2.5 Flash Explainer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowModelCards(true)}
              leftIcon={<Cpu className="w-3.5 h-3.5 text-emerald-400" />}
              className="text-xs border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/40"
            >
              Model Specs & ML
            </Button>
            <button
              onClick={() => setShowContextSidebar(!showContextSidebar)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs flex items-center gap-1.5 transition-colors"
            >
              <Info className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">Inspect AI Context</span>
            </button>
          </div>
        </div>

        {/* Privacy Engine Toggle Bar */}
        <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Privacy Architecture:</span>
            <div className="inline-flex rounded-xl p-0.5 bg-slate-900 border border-slate-800">
              <button
                type="button"
                onClick={() => setPrivacyMode('cloud')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  privacyMode === 'cloud'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ⚡ Hybrid Cloud (Gemini 2.5)
              </button>
              <button
                type="button"
                onClick={() => setPrivacyMode('local_airgap')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  privacyMode === 'local_airgap'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Lock className="w-3 h-3 text-emerald-300" />
                🛡️ 100% Local Airgap Mode
              </button>
            </div>
          </div>
          <div className="text-[11px] flex items-center gap-1.5">
            {privacyMode === 'local_airgap' ? (
              <span className="text-emerald-400 flex items-center gap-1 font-mono font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Airgap Active: 0 Bytes to 3rd Party Cloud
              </span>
            ) : (
              <span className="text-blue-400 flex items-center gap-1 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Sanitized Stats Only (Zero Database Query Access)
              </span>
            )}
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3.5 max-w-3xl ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gradient-to-tr from-teal-500 to-blue-600 text-white'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed space-y-2 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none shadow-md'
                }`}
              >
                {msg.role === 'user' ? (
                  <p>{msg.content}</p>
                ) : (
                  <div>
                    {msg.observed && msg.forecast && msg.suggestion ? (
                      <div className="space-y-3">
                        <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
                          <span className="font-bold text-teal-300 block mb-1 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                            Observed Records:
                          </span>
                          <p className="text-slate-300 leading-relaxed">{msg.observed}</p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
                          <span className="font-bold text-blue-300 block mb-1 flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                            Model Projections:
                          </span>
                          <p className="text-slate-300 leading-relaxed">{msg.forecast}</p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
                          <span className="font-bold text-emerald-300 block mb-1 flex items-center gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
                            Proactive Coaching Action:
                          </span>
                          <p className="text-slate-300 leading-relaxed">{msg.suggestion}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="whitespace-pre-line text-slate-200">{msg.content}</div>
                    )}

                    {msg.privacyMetadata ? (
                      <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono flex-wrap gap-1">
                        <span className="flex items-center gap-1">
                          {msg.privacyMetadata.mode === 'LOCAL_AIRGAP_ENGINE' ? (
                            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              Local Airgap Mode ({msg.privacyMetadata.thirdPartyBytesSent} bytes sent)
                            </span>
                          ) : (
                            <span className="text-blue-400 flex items-center gap-1 font-semibold">
                              <Sparkles className="w-3 h-3 text-blue-400" />
                              Gemini 2.5 Flash Explainer
                            </span>
                          )}
                        </span>
                        <span className={msg.privacyMetadata.mode === 'LOCAL_AIRGAP_ENGINE' ? 'text-emerald-400' : 'text-slate-400'}>
                          {msg.privacyMetadata.privacyGuarantee}
                        </span>
                      </div>
                    ) : msg.provider ? (
                      <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>Engine: {msg.provider === 'gemini' ? 'Gemini 2.5 Flash Explainer' : 'Deterministic Statistical Fallback'}</span>
                        <span className="text-emerald-400">Zero Hallucination Grounded</span>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3.5 max-w-xl">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                Analyzing statistical projections & formulating coaching response...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Prompts & Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 space-y-3">
          {/* Quick Prompts */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {samplePrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="text-[11px] px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white whitespace-nowrap transition-colors border border-slate-700/50 cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything about your income, spending, forecast quantiles, or anomalies..."
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
              className="text-xs text-slate-500 hover:text-white cursor-pointer"
            >
              Close
            </button>
          </div>

          <p className="text-[11px] text-slate-400 leading-normal">
            For maximum privacy and mathematical rigor, Gemini never queries your raw database.
            It receives only this verified statistical intelligence snapshot:
          </p>

          {contextPreview && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Monthly Inflow / Outflow</span>
                <span className="font-mono font-bold text-white">
                  {formatBDT(contextPreview.monthlyIncome)} / {formatBDT(contextPreview.monthlyExpenses)}
                </span>
              </div>

              {contextPreview.statisticalForecast && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-blue-500/20">
                  <span className="text-slate-400 block text-[10px]">Holt-Winters Statistical Forecast</span>
                  <span className="font-mono font-bold text-blue-300">
                    Backtest MAPE: {contextPreview.statisticalForecast.mape}%
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1">
                    P10: {formatBDT(contextPreview.statisticalForecast.quantileBounds.p10EndingBalance)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    P90: {formatBDT(contextPreview.statisticalForecast.quantileBounds.p90EndingBalance)}
                  </div>
                </div>
              )}

              {contextPreview.anomalies && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-amber-500/20">
                  <span className="text-slate-400 block text-[10px]">Statistical Anomalies</span>
                  <span className="font-mono font-bold text-amber-300">
                    {contextPreview.anomalies.totalDetected} Outliers Flagged (Z-Score &gt; 2.2)
                  </span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Health Score</span>
                <span className="font-mono font-bold text-emerald-400">
                  {contextPreview.financialHealthScore}/100 ({contextPreview.healthTier})
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Top Spending Areas</span>
                <ul className="mt-1 space-y-1 text-slate-300">
                  {contextPreview.topSpendingCategories?.map((c: any) => (
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
                  +{formatBDT(contextPreview.forecast?.projectedNetCashFlow)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      <ModelCardsModal isOpen={showModelCards} onClose={() => setShowModelCards(false)} />
    </div>
  );
};
