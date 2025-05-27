// src/services/websocket.ts
import { useLiveStore } from '../store';
import type { Comment, Explanation } from '../api';

export class LiveWebSocketManager {
  private commentWs: WebSocket | null = null;
  private explanationWs: WebSocket | null = null;
  private liveId: string | number | null = null;
  private currentUserId: number | null = null;
  private baseUrl: string;
  private reconnectTimers: { comment?: number; explanation?: number } = {};
  private reconnectAttempts: { comment: number; explanation: number } = { comment: 0, explanation: 0 };
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  constructor() {
    // 从api.ts获取baseURL并转换为WebSocket URL
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://lcmonitor.dynv6.net';
    this.baseUrl = apiBaseUrl.replace(/^https?:\/\//, (match: string) => {
      return match.startsWith('https') ? 'wss://' : 'ws://';
    });
  }

  // 修改连接方法以使用新的URL格式
  async connect(liveId: string | number, userId: number): Promise<void> {
    this.liveId = liveId;
    this.currentUserId = userId;

    // 关闭现有连接
    this.disconnect();

    // 从store获取WebSocket URL
    const liveStore = useLiveStore();
    const commentUrl = liveStore.commentRoomUrl.replace('?nickname=', `?nickname=${userId}_comment&`);
    const explanationUrl = liveStore.explanationRoomUrl.replace('?nickname=', `?nickname=${userId}_explanation&`);

    // 同时连接两个WebSocket
    await Promise.all([
      this.connectToUrl('comment', commentUrl),
      this.connectToUrl('explanation', explanationUrl)
    ]);
  }

  // 新增：直接连接到指定URL的方法
  private connectToUrl(type: 'comment' | 'explanation', wsUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`连接${type} WebSocket:`, wsUrl);

      try {
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log(`${type} WebSocket连接成功`);
          this.reconnectAttempts[type] = 0;
          resolve();
        };

        // 其他事件处理保持不变...
        ws.onmessage = (event) => {
          try {
            console.log(`收到${type} WebSocket消息:`, event.data);
            this.handleMessage(type, event.data);
          } catch (error) {
            console.error(`处理${type} WebSocket消息失败:`, error);
          }
        };

        ws.onclose = (event) => {
          console.log(`${type} WebSocket连接已关闭:`, event.code, event.reason);

          if (event.code !== 1000 && this.reconnectAttempts[type] < this.maxReconnectAttempts) {
            this.scheduleReconnect(type);
          }
        };

        ws.onerror = (error) => {
          console.error(`${type} WebSocket连接错误:`, error);
          reject(error);
        };

        // 保存WebSocket连接
        if (type === 'comment') {
          this.commentWs = ws;
        } else {
          this.explanationWs = ws;
        }

        // 连接超时处理
        setTimeout(() => {
          if (ws.readyState === WebSocket.CONNECTING) {
            ws.close();
            reject(new Error(`${type} WebSocket连接超时`));
          }
        }, 10000);

      } catch (error) {
        reject(error);
      }
    });
  }

  // 连接单个WebSocket
  private connectWebSocket(type: 'comment' | 'explanation', liveId: string | number, userId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      // 为了区分两个连接，我们可以在nickname后添加类型标识
      const wsUrl = `${this.baseUrl}/ws/chat/${liveId}/?nickname=${userId}_${type}`;
      console.log(`连接${type} WebSocket:`, wsUrl);

      try {
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log(`${type} WebSocket连接成功`);
          this.reconnectAttempts[type] = 0;
          resolve();
        };

        ws.onmessage = (event) => {
          try {
            console.log(`收到${type} WebSocket消息:`, event.data);
            this.handleMessage(type, event.data);
          } catch (error) {
            console.error(`处理${type} WebSocket消息失败:`, error);
          }
        };

        ws.onclose = (event) => {
          console.log(`${type} WebSocket连接已关闭:`, event.code, event.reason);

          // 如果不是主动关闭，尝试重连
          if (event.code !== 1000 && this.reconnectAttempts[type] < this.maxReconnectAttempts) {
            this.scheduleReconnect(type);
          }
        };

        ws.onerror = (error) => {
          console.error(`${type} WebSocket连接错误:`, error);
          reject(error);
        };

        // 保存WebSocket连接
        if (type === 'comment') {
          this.commentWs = ws;
        } else {
          this.explanationWs = ws;
        }

        // 连接超时处理
        setTimeout(() => {
          if (ws.readyState === WebSocket.CONNECTING) {
            ws.close();
            reject(new Error(`${type} WebSocket连接超时`));
          }
        }, 10000);

      } catch (error) {
        reject(error);
      }
    });
  }

  // 发送消息到指定的WebSocket
  async sendMessage(type: 'comment' | 'explanation', content: string): Promise<boolean> {
    const ws = type === 'comment' ? this.commentWs : this.explanationWs;

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn(`${type} WebSocket未连接，跳过WebSocket发送`);
      return false; // 不抛出错误，让HTTP请求继续
    }

    if (!this.currentUserId) {
      console.warn('用户信息缺失');
      return false;
    }

    try {
      // 发送消息格式：直接发送消息内容，服务器会处理格式
      ws.send(content);
      console.log(`${type} WebSocket消息发送成功:`, content);
      return true;
    } catch (error) {
      console.error(`${type} WebSocket发送失败:`, error);
      return false;
    }
  }

  // 处理接收到的消息
  private handleMessage(type: 'comment' | 'explanation', rawMessage: string) {
    const liveStore = useLiveStore();

    // 解析消息格式 - 假设格式为 "nickname: message"
    const messagePattern = /^(.+?):\s*(.+)$/;
    const match = rawMessage.match(messagePattern);

    if (!match) {
      console.warn('无法解析消息格式:', rawMessage);
      return;
    }

    const [, nickname, content] = match;

    // 过滤掉自己发送的消息（防止重复显示）
    const userId = nickname.replace(`_${type}`, ''); // 移除类型标识
    if (userId === this.currentUserId?.toString()) {
      return;
    }

    // 创建消息对象
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const parsedUserId = parseInt(userId) || 0;

    if (type === 'comment') {
      // 创建评论对象
      const comment: Comment = {
        comment_id: Date.now() + Math.random(), // 临时ID
        creator_user_id: parsedUserId,
        user_id: parsedUserId,
        content: content.trim(),
        created_at: timestamp,
        living_stream_id: this.liveId as number,
      };

      // 检查是否已存在该消息（避免重复）
      const exists = liveStore.comments.some(c =>
        c.creator_user_id === comment.creator_user_id &&
        c.content === comment.content &&
        Math.abs(new Date(c.created_at + '+08:00').getTime() - new Date(comment.created_at + '+08:00').getTime()) < 5000
      );

      if (!exists) {
        console.log('添加新的评论消息:', comment);
        liveStore.comments.push(comment);
      }
    } else if (type === 'explanation') {
      // 创建讲解对象
      const explanation: Explanation = {
        expla_id: Date.now() + Math.random(), // 临时ID
        explanation_id: Date.now() + Math.random(), // 临时ID
        user_id: parsedUserId,
        creator_user_id: parsedUserId,
        content: content.trim(),
        created_at: timestamp,
        living_stream_id: this.liveId as number,
      };

      // 检查是否已存在该消息（避免重复）
      const exists = liveStore.explanations.some(e =>
        e.creator_user_id === explanation.creator_user_id &&
        e.content === explanation.content &&
        Math.abs(new Date(e.created_at + '+08:00').getTime() - new Date(explanation.created_at + '+08:00').getTime()) < 5000
      );

      if (!exists) {
        console.log('添加新的讲解消息:', explanation);
        liveStore.explanations.push(explanation);
      }
    }
  }

  // 安排重连
  private scheduleReconnect(type: 'comment' | 'explanation') {
    if (this.reconnectTimers[type]) {
      clearTimeout(this.reconnectTimers[type]);
    }

    this.reconnectAttempts[type]++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts[type] - 1);

    console.log(`${delay / 1000}秒后尝试重连${type} WebSocket（第${this.reconnectAttempts[type]}次）...`);

    this.reconnectTimers[type] = window.setTimeout(() => {
      if (this.liveId && this.currentUserId) {
        this.connectWebSocket(type, this.liveId, this.currentUserId).catch(error => {
          console.error(`${type} WebSocket重连失败:`, error);
        });
      }
    }, delay);
  }

  // 断开所有连接
  disconnect() {
    // 清除重连定时器
    Object.values(this.reconnectTimers).forEach(timer => {
      if (timer) clearTimeout(timer);
    });
    this.reconnectTimers = {};

    // 关闭WebSocket连接
    if (this.commentWs) {
      this.commentWs.close(1000, '主动断开');
      this.commentWs = null;
    }

    if (this.explanationWs) {
      this.explanationWs.close(1000, '主动断开');
      this.explanationWs = null;
    }

    this.liveId = null;
    this.currentUserId = null;
    this.reconnectAttempts = { comment: 0, explanation: 0 };
  }

  // 获取连接状态
  get connectionStatus(): { comment: string; explanation: string } {
    return {
      comment: this.getWSStatus(this.commentWs),
      explanation: this.getWSStatus(this.explanationWs)
    };
  }

  get isConnected(): { comment: boolean; explanation: boolean } {
    return {
      comment: this.commentWs !== null && this.commentWs.readyState === WebSocket.OPEN,
      explanation: this.explanationWs !== null && this.explanationWs.readyState === WebSocket.OPEN
    };
  }

  private getWSStatus(ws: WebSocket | null): string {
    if (!ws) return '未连接';

    switch (ws.readyState) {
      case WebSocket.CONNECTING: return '连接中';
      case WebSocket.OPEN: return '已连接';
      case WebSocket.CLOSING: return '关闭中';
      case WebSocket.CLOSED: return '已关闭';
      default: return '未知状态';
    }
  }
}

// 创建全局实例
export const wsManager = new LiveWebSocketManager();