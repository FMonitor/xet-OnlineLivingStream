// src/services/websocket.ts
import { useLiveStore } from '../store';
import type { Comment, Explanation } from '../api';

// src/services/websocket.ts
export class LiveWebSocketManager {
  private commentWs: WebSocket | null = null;
  private explanationWs: WebSocket | null = null;
  private liveId: string | number | null = null;
  private currentUserId: number | null = null;
  private reconnectTimers: { comment?: number; explanation?: number } = {};
  private reconnectAttempts: { comment: number; explanation: number } = { comment: 0, explanation: 0 };
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  async connect(liveId: string | number, userId: number): Promise<void> {
    // 先关闭现有连接，但保存新的参数
    this.disconnect(false);

    // 在断开连接后重新设置参数
    this.liveId = liveId;
    this.currentUserId = userId;

    // 从store获取WebSocket URL
    const liveStore = useLiveStore();

    // 直接在原始URL后添加用户ID
    const commentUrl = liveStore.commentRoomUrl + userId;
    const explanationUrl = liveStore.explanationRoomUrl + userId;

    console.log('准备连接的WebSocket URLs:', {
      comment: commentUrl,
      explanation: explanationUrl
    });

    try {
      // 同时连接两个WebSocket
      await Promise.all([
        this.connectToUrl('comment', commentUrl),
        this.connectToUrl('explanation', explanationUrl)
      ]);
      console.log('所有WebSocket连接成功');
    } catch (error) {
      console.error('WebSocket连接失败:', error);
      throw error;
    }
  }

  // 直接连接到指定URL的方法
  private connectToUrl(type: 'comment' | 'explanation', wsUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`正在连接 ${type} WebSocket:`, wsUrl);

      try {
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log(`${type} WebSocket连接成功`);
          this.reconnectAttempts[type] = 0;
          resolve();
        };

        ws.onmessage = (event) => {
          try {
            // console.log(`收到 ${type} WebSocket消息:`, event.data);
            this.handleMessage(type, event.data);
          } catch (error) {
            // console.error(`处理 ${type} WebSocket消息失败:`, error);
          }
        };

        ws.onclose = (event) => {
          console.log(`${type} WebSocket连接已关闭:`, {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean
          });

          // 如果不是主动关闭(1000)，尝试重连
          if (event.code !== 1000 && this.reconnectAttempts[type] < this.maxReconnectAttempts) {
            console.log(`准备重连 ${type} WebSocket...`);
            this.scheduleReconnect(type, wsUrl);
          }
        };

        ws.onerror = (error) => {
          console.error(`${type} WebSocket连接错误:`, error);
          reject(new Error(`${type} WebSocket连接失败`));
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
            console.warn(`${type} WebSocket连接超时，强制关闭`);
            ws.close();
            reject(new Error(`${type} WebSocket连接超时`));
          }
        }, 10000);

      } catch (error) {
        console.error(`创建 ${type} WebSocket时发生错误:`, error);
        reject(error);
      }
    });
  }

  // 发送消息到指定的WebSocket
  async sendMessage(type: 'comment' | 'explanation', content: string): Promise<boolean> {
    const ws = type === 'comment' ? this.commentWs : this.explanationWs;

    console.log(`尝试通过 ${type} WebSocket发送消息:`, {
      hasWs: !!ws,
      wsState: ws?.readyState,
      currentUserId: this.currentUserId,
      content: content
    });

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn(`${type} WebSocket未连接，状态:`, ws?.readyState);
      return false;
    }

    if (!this.currentUserId) {
      console.warn('用户信息缺失，无法发送消息');
      return false;
    }

    try {
      // 直接发送消息内容
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
    // console.log(`处理收到的 ${type} 消息:`, rawMessage);
    // console.log(`消息长度: ${rawMessage.length}`);
    // console.log(`消息字符编码:`, Array.from(rawMessage).map(char => char.charCodeAt(0)));

    const liveStore = useLiveStore();

    // 清理消息 - 移除所有可能的不可见字符
    const cleanMessage = rawMessage.trim().replace(/[\r\n\t]/g, '');
    // console.log(`清理后的消息: "${cleanMessage}"`);

    let userId: number | undefined;
    let content: string | undefined;

    // 修正消息格式解析：实际格式为 "用户ID: 消息内容"
    // 使用更宽松的正则表达式
    const messagePattern = /^(\d+):\s*(.*)$/;
    const match = cleanMessage.match(messagePattern);

    // console.log(`正则匹配结果:`, match);

    if (match && match.length >= 3) {
        userId = parseInt(match[1]);
        content = match[2].trim();
        
        // console.log(`解析成功 - 用户ID: ${userId}, 内容: "${content}"`);
        
        // 验证解析结果
        if (isNaN(userId) || userId < 0) {
            console.warn(`无效的用户ID: ${userId}`);
            return;
        }
        
        if (!content || content.length === 0) {
            console.warn(`消息内容为空`);
            return;
        }
    } else {
        // console.warn('标准格式解析失败，尝试其他格式...');
        
        // 尝试解析其他可能的格式
        const alternativePatterns = [
            /^(\d+)\s*:\s*(.+)$/,  // 可能有多个空格
            /^user(\d+):\s*(.+)$/i, // user1: message
            /^(\d+)-(.+)$/,        // 1-message
            /^(\d+)_(.+)$/         // 1_message
        ];
        
        let parsed = false;
        for (const pattern of alternativePatterns) {
            const altMatch = cleanMessage.match(pattern);
            if (altMatch && altMatch.length >= 3) {
                userId = parseInt(altMatch[1]);
                content = altMatch[2].trim();
                // console.log(`使用备用格式解析成功 - 用户ID: ${userId}, 内容: "${content}"`);
                parsed = true;
                break;
            }
        }
        
        if (!parsed) {
            // console.warn('所有格式解析都失败，原始消息:', {
            //     raw: rawMessage,
            //     clean: cleanMessage,
            //     length: rawMessage.length,
            //     chars: Array.from(rawMessage).map(c => `${c}(${c.charCodeAt(0)})`)
            // });
            return;
        }
    }

    // 类型保护，确保 userId 和 content 已赋值
    if (typeof userId !== 'number' || typeof content !== 'string') {
        console.warn('userId 或 content 未正确解析，跳过处理');
        return;
    }

    // 过滤掉自己发送的消息（防止重复显示）
    if (userId === this.currentUserId) {
        // console.log(`跳过自己发送的消息 - 用户ID: ${userId}`);
        return;
    }

    // 创建消息对象
    const now = new Date();
    const timestamp = new Date(now.getTime() + 8 * 60 * 60 * 1000)
        .toISOString()
        .replace('T', ' ')
        .slice(0, 19);

    if (type === 'comment') {
        const comment: Comment = {
            comment_id: Date.now() + Math.random(),
            creator_user_id: userId,
            content: content,
            created_at: timestamp,
            living_stream_id: this.liveId as number,
        };

        // 检查是否已存在该消息（避免重复）
        const exists = liveStore.comments.some(c =>
            c.creator_user_id === comment.creator_user_id &&
            c.content === comment.content &&
            Math.abs(new Date(c.created_at).getTime() - new Date(comment.created_at).getTime()) < 3000 // 3秒内算重复
        );

        if (!exists) {
            // console.log('添加新的评论消息:', comment);
            liveStore.comments.push(comment);
            
            // 触发界面更新
            setTimeout(() => {
                // console.log('当前评论列表长度:', liveStore.comments.length);
            }, 100);
        } else {
            // console.log('跳过重复的评论消息:', comment);
        }
    } else if (type === 'explanation') {
        const explanation: Explanation = {
            expla_id: Date.now() + Math.random(),
            creator_user_id: userId,
            content: content,
            created_at: timestamp,
            living_stream_id: this.liveId as number,
        };

        const exists = liveStore.explanations.some(e =>
            e.creator_user_id === explanation.creator_user_id &&
            e.content === explanation.content &&
            Math.abs(new Date(e.created_at).getTime() - new Date(explanation.created_at).getTime()) < 3000
        );

        if (!exists) {
            // console.log('添加新的讲解消息:', explanation);
            liveStore.explanations.push(explanation);
        } else {
            // console.log('跳过重复的讲解消息:', explanation);
        }
    }
}

  // 安排重连
  private scheduleReconnect(type: 'comment' | 'explanation', wsUrl: string) {
    if (this.reconnectTimers[type]) {
      clearTimeout(this.reconnectTimers[type]);
    }

    this.reconnectAttempts[type]++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts[type] - 1);

    console.log(`${delay / 1000}秒后尝试重连 ${type} WebSocket（第${this.reconnectAttempts[type]}次）...`);

    this.reconnectTimers[type] = window.setTimeout(() => {
      console.log(`开始重连 ${type} WebSocket`);
      this.connectToUrl(type, wsUrl).catch(error => {
        console.error(`${type} WebSocket重连失败:`, error);
      });
    }, delay);
  }

  // 断开所有连接
  disconnect(clearUserInfo: boolean = true) {
    console.log('断开WebSocket连接, clearUserInfo:', clearUserInfo);

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

    if (clearUserInfo) {
      this.liveId = null;
      this.currentUserId = null;
    }

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