import { offlineStorage } from './offlineStorage';
import apiClient from './apiClient';

class SyncManager {
  constructor() {
    this.QUEUE_KEY = 'sync_queue';
    this.isSyncing = false;
    this.listeners = new Set();
    
    window.addEventListener('online', () => this.sync());
    window.addEventListener('offline', () => this.notify({ type: 'OFFLINE' }));
  }

  subscribe(listener) {
    this.listeners.add(listener);
    // Initial status check
    this.checkStatus().then(status => listener(status));
    return () => this.listeners.delete(listener);
  }

  notify(status) {
    this.listeners.forEach(listener => listener(status));
  }
  
  async checkStatus() {
    if (!navigator.onLine) {
        const queue = await offlineStorage.getItem(this.QUEUE_KEY) || [];
        return { type: 'OFFLINE', count: queue.length };
    }
    const queue = await offlineStorage.getItem(this.QUEUE_KEY) || [];
    if (queue.length > 0) {
        return { type: 'PENDING', count: queue.length };
    }
    return { type: 'ONLINE', count: 0 };
  }

  async enqueue(action) {
    const queue = await offlineStorage.getItem(this.QUEUE_KEY) || [];
    queue.push({
      ...action,
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    });
    await offlineStorage.setItem(this.QUEUE_KEY, queue);
    this.notify({ type: 'PENDING', count: queue.length });
    
    if (navigator.onLine) {
      this.sync();
    }
  }

  async sync() {
    if (this.isSyncing || !navigator.onLine) return;
    
    let queue = await offlineStorage.getItem(this.QUEUE_KEY) || [];
    if (queue.length === 0) {
      this.notify({ type: 'ONLINE', count: 0 });
      return;
    }

    this.isSyncing = true;
    this.notify({ type: 'SYNCING', count: queue.length });

    const failedQueue = [];

    try {
      // Send queued actions to the backend sync endpoint
      const response = await apiClient.post('/records/sync', { actions: queue });
      if (response.data.success) {
        // Success, clear queue
        await offlineStorage.setItem(this.QUEUE_KEY, []);
      } else {
        // If server failed explicitly but returned 200, we might want to keep the queue
        failedQueue.push(...queue);
        await offlineStorage.setItem(this.QUEUE_KEY, failedQueue);
      }
    } catch (error) {
      console.error('Background sync failed', error);
      failedQueue.push(...queue);
      await offlineStorage.setItem(this.QUEUE_KEY, failedQueue);
    } finally {
      this.isSyncing = false;
      this.notify({ type: navigator.onLine ? 'ONLINE' : 'OFFLINE', count: failedQueue.length });
    }
  }
}

export const syncManager = new SyncManager();
