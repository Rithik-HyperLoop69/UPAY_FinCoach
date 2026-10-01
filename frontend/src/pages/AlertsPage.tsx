import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle2,
  Check,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { api } from '../api/client';
import { AlertItem } from '../types';
import { formatDate } from '../utils/formatters';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<AlertItem[]>('/alerts');
      setAlerts(res);
    } catch (e) {
      console.error('Failed to load alerts:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/alerts/${id}/read`);
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)));
    } catch (e) {
      console.error('Mark read failed:', e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/alerts/read-all');
      setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
    } catch (e) {
      console.error('Mark all read failed:', e);
    }
  };

  const filteredAlerts = filter === 'UNREAD' ? alerts.filter((a) => !a.isRead) : alerts;

  if (isLoading) {
    return <LoadingSpinner message="Checking financial alerts and warnings..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Financial Alerts & Notifications
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time warnings on budget limits, recurring payment dates, and cash shortages
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            leftIcon={<Check className="w-3.5 h-3.5" />}
          >
            Mark All as Read
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            filter === 'ALL'
              ? 'bg-blue-600 text-white shadow'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          All Notifications ({alerts.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            filter === 'UNREAD'
              ? 'bg-blue-600 text-white shadow'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          Unread ({alerts.filter((a) => !a.isRead).length})
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <Card className="p-12 text-center text-slate-400">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-emerald-400 opacity-60" />
            <p className="font-semibold text-white">All caught up!</p>
            <p className="text-xs mt-1">No active unread financial warnings at this moment.</p>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Card
              key={alert.id}
              className={`p-4 transition-all ${
                !alert.isRead
                  ? 'bg-slate-900/90 border-blue-500/30 shadow-lg'
                  : 'bg-slate-950/40 border-slate-800/80 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-rose-500/10 text-rose-400'
                        : alert.severity === 'WARNING'
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-blue-500/10 text-blue-400'
                    }`}
                  >
                    {alert.severity === 'CRITICAL' ? (
                      <ShieldAlert className="w-5 h-5" />
                    ) : alert.severity === 'WARNING' ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <Info className="w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{alert.title}</span>
                      <Badge
                        variant={
                          alert.severity === 'CRITICAL'
                            ? 'rose'
                            : alert.severity === 'WARNING'
                            ? 'amber'
                            : 'blue'
                        }
                        size="sm"
                      >
                        {alert.severity}
                      </Badge>
                      {!alert.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                      {alert.message}
                    </p>
                    <span className="text-[10px] text-slate-500 block pt-1">
                      {formatDate(alert.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {alert.actionUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(alert.actionUrl!)}
                      rightIcon={<ExternalLink className="w-3 h-3" />}
                      className="text-xs py-1 px-2.5"
                    >
                      Action
                    </Button>
                  )}

                  {!alert.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(alert.id)}
                      className="text-xs text-slate-400 hover:text-white py-1 px-2"
                    >
                      Mark Read
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
