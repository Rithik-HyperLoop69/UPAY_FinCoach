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

interface ParsedResult {
  type: 'EXPENSE' | 'INCOME' | 'TRANSFER';
  amount: number;
  fee: number;
  balanceAfter?: number;
  merchant: string;
  category: string;
  description: string;
  trxId: string;
  paymentMethod: string;
  rawSms: string;
}

const SAMPLE_SMS = [
  {
    label: '⚡ DESCO Bill Pay ৳3,850',
    text: 'Bill Pay of Tk 3,850.00 to DESCO Electricity successful. Fee Tk 0.00. Balance Tk 14,470.00. TrxID 7B8C9D0E at 02/10/2026 14:15',
  },
  {
    label: '🛍️ Aarong Fashion ৳1,450',
    text: 'Payment of Tk 1,450.00 to Aarong successful. Balance Tk 18,320.00. TrxID 8A9B2C4D at 02/10/2026 19:30',
  },
  {
    label: '🛒 Shwapno Grocery ৳2,650',
    text: 'Payment of Tk 2,650.00 to Shwapno Superstore successful. Balance Tk 11,820.00. TrxID 6C7D8E9F at 02/10/2026 16:40',
  },
  {
    label: '💸 Send Money ৳1,500',
    text: 'Send Money Tk 1,500.00 to 01912345678 successful. Fee Tk 5.00. Balance Tk 8,287.00. TrxID 4E5F6A7B at 02/10/2026 18:50',
  },
  {
    label: '💵 Received Money ৳15,000',
    text: 'You have received Tk 15,000.00 from 01798765432. Balance Tk 23,087.00. TrxID 2E3F4A5B at 02/10/2026 12:00',
  },
];

export const UpaySmsModal: React.FC<UpaySmsModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [smsText, setSmsText] = useState('');
  const [parsed, setParsed] = useState<ParsedResult | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleParse = async (text: string) => {
    setSmsText(text);
    if (!text.trim() || text.trim().length < 8) {
      setParsed(null);
      setError(null);
      return;
    }

    setIsParsing(true);
    setError(null);

    try {
      const res = await api.post<{ alreadyExists: boolean; parsed: ParsedResult; message: string }>(
        '/transactions/upay/parse-sms',
        { smsText: text, autoSave: false }
      );

      setParsed(res.parsed);
      if (res.alreadyExists) {
        setError(`Notice: Transaction TrxID ${res.parsed.trxId} is already recorded in your ledger.`);
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to parse this SMS. Ensure it is a valid upay confirmation.');
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
        '/transactions/upay/parse-sms',
        { smsText, autoSave: true }
      );

      if (res.alreadyExists) {
        setError(res.message);
        return;
      }

      onSuccess(res.message || 'Transaction successfully ingested from upay SMS!');
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
      title="Auto-Track from upay SMS"
      subtitle="Instant regex parser for automated Bangladesh MFS transaction recording"
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Sample Templates Quick-Pick */}
        <div>
          <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            Quick-Test with Sample upay SMS:
          </label>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_SMS.map((sample, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleParse(sample.text)}
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
            <span>Paste upay SMS Message Text:</span>
            <span className="text-[10px] text-slate-400 font-mono">Sender: UPAY / 16268</span>
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={smsText}
              onChange={(e) => handleParse(e.target.value)}
              placeholder="e.g. Payment of Tk 1,450.00 to Aarong successful. Balance Tk 18,320.00. TrxID 8A9B2C4D..."
              className="w-full p-3.5 bg-slate-950/80 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-xs font-mono leading-relaxed"
            />
            {isParsing && (
              <span className="absolute right-3 bottom-3 text-[11px] text-teal-400 flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                Parsing...
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
                  <h4 className="text-xs font-bold text-white">{parsed.merchant}</h4>
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

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
              <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[10px]">TrxID</span>
                <span className="font-mono text-white font-medium">{parsed.trxId}</span>
              </div>
              <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[10px]">Method</span>
                <span className="text-teal-300 font-medium">upay MFS</span>
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
