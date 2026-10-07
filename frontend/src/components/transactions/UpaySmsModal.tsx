import React, { useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Tag,
  ShieldCheck,
  Send,
  Languages,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { api } from '../../api/client';
import { formatBDT } from '../../utils/formatters';

interface UpaySmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

interface ParsedMfsResult {
  provider: string;
  providerDisplayName: string;
  type: 'EXPENSE' | 'INCOME' | 'TRANSFER';
  amount: number;
  fee: number;
  balanceAfter?: number;
  counterparty: string;
  merchant?: string;
  category: string;
  description: string;
  trxId: string;
  paymentMethod: string;
  rawSms: string;
  confidence: number;
  hadBanglaNumerals?: boolean;
  detectedLanguage?: string;
}

const SAMPLE_SMS = [
  {
    provider: 'upay',
    label: '⚡ upay: DESCO Bill ৳3,850',
    text: 'Bill Pay of Tk 3,850.00 to DESCO Electricity successful. Fee Tk 0.00. Balance Tk 14,470.00. TrxID 7B8C9D0E at 02/10/2026 14:15',
  },
  {
    provider: 'bkash',
    label: '🛍️ bKash: Aarong ৳2,400',
    text: 'Payment Tk 2,400.00 to Aarong successful. Fee Tk 0.00. Balance Tk 14,200.00. TrxID 9K43JD21 at 05/10/2026',
  },
  {
    provider: 'nagad',
    label: '🛒 Nagad: Chaldal ৳640',
    text: 'Payment Tk 640.00 to Chaldal is successful. Fee: Tk 0.00. Balance: Tk 2,480.00. TxnID: 9876543B',
  },
  {
    provider: 'generic',
    label: '🇧🇩 বাংলা: ১৫০০ টাকা ক্যাশ ইন',
    text: 'আপনার অ্যাকাউন্টে ১৫০০ টাকা ক্যাশ ইন সফল হয়েছে। ব্যালেন্স ৪২৫০ টাকা। TrxID BN9921',
  },
  {
    provider: 'upay',
    label: '💸 upay: Send Money ৳1,500',
    text: 'Send Money Tk 1,500.00 to 01912345678 successful. Fee Tk 5.00. Balance Tk 8,287.00. TrxID 4E5F6A7B at 02/10/2026 18:50',
  },
];

export const UpaySmsModal: React.FC<UpaySmsModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [smsText, setSmsText] = useState('');
  const [providerHint, setProviderHint] = useState<string>('auto');
  const [parsed, setParsed] = useState<ParsedMfsResult | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleParse = async (text: string, provider = providerHint) => {
    setSmsText(text);
    if (!text.trim() || text.trim().length < 6) {
      setParsed(null);
      setError(null);
      return;
    }

    setIsParsing(true);
    setError(null);

    try {
      const res = await api.post<{ alreadyExists: boolean; parsed: ParsedMfsResult; message: string }>(
        '/transactions/mfs/parse-sms',
        {
          smsText: text,
          providerHint: provider === 'auto' ? undefined : provider,
          autoSave: false,
        }
      );

      setParsed(res.parsed);
      if (res.alreadyExists) {
        setError(`Notice: Transaction ID ${res.parsed.trxId} is already recorded in your ledger.`);
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to parse SMS. Ensure it contains a valid transaction record.');
      setParsed(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleIngest = async () => {
    if (!smsText.trim()) return;
    setIsIngesting(true);
    setError(null);

    try {
      const res = await api.post<{ alreadyExists: boolean; message: string; transaction: any }>(
        '/transactions/mfs/parse-sms',
        {
          smsText,
          providerHint: providerHint === 'auto' ? undefined : providerHint,
          autoSave: true,
        }
      );

      if (res.alreadyExists) {
        setError(res.message);
        return;
      }

      onSuccess(res.message || 'Transaction successfully ingested from MFS SMS!');
      setSmsText('');
      setParsed(null);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to ingest transaction from SMS.');
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Universal MFS & Bengali SMS Ingestion"
      subtitle="Intelligent parser supporting upay, bKash, Nagad, Rocket, and Bengali script (০-৯)"
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Provider Selector Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-400">Target MFS:</span>
          {(['auto', 'upay', 'bkash', 'nagad', 'rocket'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setProviderHint(p);
                if (smsText.trim()) handleParse(smsText, p);
              }}
              className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                providerHint === p
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {p === 'auto' ? 'Auto-Detect' : p.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Sample Templates Quick-Pick */}
        <div>
          <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            Quick-Test with Sample Bangladeshi SMS:
          </label>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_SMS.map((sample, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setProviderHint(sample.provider === 'generic' ? 'auto' : sample.provider);
                  handleParse(sample.text, sample.provider === 'generic' ? 'auto' : sample.provider);
                }}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-teal-500/20 border border-slate-700 hover:border-teal-500/40 text-slate-300 hover:text-teal-200 transition-all cursor-pointer"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* SMS Textarea Input */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center justify-between">
            <span>Paste MFS / Banking SMS Text:</span>
            <span className="text-[10px] text-slate-400 font-mono">Accepts English, Banglish & Bangla (০-৯)</span>
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={smsText}
              onChange={(e) => handleParse(e.target.value)}
              placeholder="e.g. Payment of Tk 1,450.00 to Aarong... or আপনার অ্যাকাউন্টে ১৫০০ টাকা ক্যাশ ইন সফল হয়েছে..."
              className="w-full p-3.5 bg-slate-950/80 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-xs font-mono leading-relaxed"
            />
            {isParsing && (
              <span className="absolute right-3 bottom-3 text-[11px] text-teal-400 flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                Normalizing & Parsing...
              </span>
            )}
          </div>
        </div>

        {/* Error / Notice Display */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Parsed Preview Card */}
        {parsed && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-teal-500/30 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-2.5">
              <div className="flex items-center gap-2">
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    parsed.type === 'INCOME'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : parsed.type === 'TRANSFER'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {parsed.type === 'INCOME' ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : parsed.type === 'TRANSFER' ? (
                    <ArrowLeftRight className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white">{parsed.merchant || parsed.counterparty}</h4>
                  <span className="text-[10px] text-slate-400">{parsed.category}</span>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`text-base font-extrabold font-mono ${
                    parsed.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {parsed.type === 'INCOME' ? '+' : '-'} {formatBDT(parsed.amount)}
                </span>
                {parsed.fee > 0 && (
                  <p className="text-[10px] text-slate-400 font-mono">Fee: {formatBDT(parsed.fee)}</p>
                )}
              </div>
            </div>

            {/* Badges for MFS Provider and Bengali Processing */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="blue" size="sm">
                Provider: {parsed.providerDisplayName || parsed.provider.toUpperCase()}
              </Badge>
              <Badge variant="emerald" size="sm">
                Confidence: {Math.round(parsed.confidence * 100)}%
              </Badge>
              {parsed.hadBanglaNumerals && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1 font-mono">
                  <Languages className="w-3 h-3" />
                  Bengali Numerals (০-৯ ➔ 0-9)
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
              <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[10px]">TrxID / TxnID</span>
                <span className="font-mono text-white font-medium truncate block">{parsed.trxId}</span>
              </div>
              <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[10px]">Payment Method</span>
                <span className="text-teal-300 font-medium">{parsed.paymentMethod}</span>
              </div>
              <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[10px]">Status</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              </div>
              <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[10px]">Balance After</span>
                <span className="font-mono text-white font-medium">
                  {parsed.balanceAfter ? formatBDT(parsed.balanceAfter) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isIngesting}>
            Cancel
          </Button>
          <Button
            variant="upay"
            size="sm"
            onClick={handleIngest}
            disabled={!parsed || isIngesting}
            isLoading={isIngesting}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Ingest to Ledger
          </Button>
        </div>
      </div>
    </Modal>
  );
};
