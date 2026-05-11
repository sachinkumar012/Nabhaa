import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle } from 'lucide-react';
import { syncManager } from '../../services/syncManager';
import { useTranslation } from 'react-i18next';

const SyncStatusIndicator = () => {
  const [status, setStatus] = useState({ type: 'ONLINE', count: 0 });
  const { t } = useTranslation();

  useEffect(() => {
    const unsubscribe = syncManager.subscribe(setStatus);
    return unsubscribe;
  }, []);

  const renderIcon = () => {
    switch (status.type) {
      case 'OFFLINE':
        return <CloudOff className="w-4 h-4 text-gray-500" />;
      case 'PENDING':
        return <Cloud className="w-4 h-4 text-yellow-500" />;
      case 'SYNCING':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'ONLINE':
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const renderText = () => {
    switch (status.type) {
      case 'OFFLINE':
        return t('status.offline', 'Offline');
      case 'PENDING':
        return `${status.count} ${t('status.pending', 'Pending Sync')}`;
      case 'SYNCING':
        return t('status.syncing', 'Syncing...');
      case 'ONLINE':
      default:
        return t('status.synced', 'Synced');
    }
  };

  return (
    <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 shadow-sm border border-gray-200">
      {renderIcon()}
      <span>{renderText()}</span>
    </div>
  );
};

export default SyncStatusIndicator;
