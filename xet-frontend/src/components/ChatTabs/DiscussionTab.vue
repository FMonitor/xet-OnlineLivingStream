<template>
    <div class="discussion-tab" ref="containerRef" @scroll="handleScroll">
        <!-- 系统提示区域 -->
        <div class="system-notification">
            <div class="notification-content">
                <span>{{ systemNotification }}</span>
            </div>
        </div>

        <!-- 加载更多按钮   -->
        <div v-if="hasMoreData" class="load-more-container">
            <button 
                class="load-more-button" 
                @click="loadMore" 
                :disabled="isLoading">
                <img v-if="isLoading" src="../../assets/loading.gif" alt="加载中..." class="loading-gif" />
                <span v-else>上滑加载更多消息</span>
            </button>
        </div>

        <!-- 消息列表 -->
        <div v-for="msg in formattedMessages" :key="msg.id" :class="['message-item', msg.isSelf ? 'self' : 'other']">
            <!-- 他人消息（左侧） -->
            <div v-if="!msg.isSelf" class="message-left">
                <img class="avatar" 
                     :src="getReactiveAvatar(msg.creator_user_id ?? 0)" 
                     @error="handleAvatarError($event, msg.creator_user_id ?? 0)"
                     alt="avatar" />
                <div class="message-content">
                    <div class="meta">
                        <span class="name">{{ msg.creator_user_id === 0 ? '匿名用户' : '用户' + msg.creator_user_id + ' '
                        }}</span>
                        <span class="time">{{ formatTime(msg.created_at) }}</span>
                    </div>
                    <div class="bubble">{{ msg.content }}</div>
                </div>
            </div>

            <!-- 自己消息（右侧） -->
            <!-- 修改自己消息气泡部分 -->
            <div v-else class="message-right">
                <div class="message-content">
                    <div class="meta self-meta">
                        <span class="time">{{ formatTime(msg.created_at) + ' ' }}</span>
                        <span class="name">{{ currentUserName }}</span>
                    </div>
                    <div class="bubble"
                        :class="{ 'self-bubble': msg.isSelf, 'sending': msg.sending, 'error': msg.error }">
                        {{ msg.content }}
                        <span v-if="msg.sending" class="status-indicator">发送中...</span>
                        <div v-if="msg.error" class="error-actions">
                            <span class="error-indicator">发送失败</span>
                            <button class="retry-button" @click="retryMessage(msg)">重试</button>
                        </div>
                    </div>
                </div>
                <img class="avatar" 
                     :src="getReactiveAvatar(msg.creator_user_id ?? 0)" 
                     @error="handleAvatarError($event, msg.creator_user_id ?? 0)"
                     alt="avatar" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { getAvatar, avatarUpdateTrigger } from '../../avatarCache'; // 引入头像缓存工具
import { defineProps, defineEmits, ref, computed, watch, nextTick, onMounted } from 'vue'
import type { Comment, Explanation } from '../../api'

const props = defineProps({
    messages: {
        type: Array as () => Comment[],
        required: true
    },
    currentUserId: {
        type: Number,
        default: 0
    },
    isLoading: {
        type: Boolean,
        default: false
    },
    hasMoreData: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['load-more', 'retry-message'])
const containerRef = ref<HTMLElement | null>(null)
const currentUserName = "我"
const lastScrollHeight = ref(0)
const isUserScrolling = ref(false) // 标记用户是否正在手动滚动
const autoScrollThreshold = 100 // 距离底部多少像素内才自动滚动

// 根据API返回的Comment格式，计算是否是自己发送的消息
const formattedMessages = computed(() => {
    return props.messages.map(msg => ({
        ...msg,
        id: msg.comment_id,
        isSelf: msg.creator_user_id === props.currentUserId
    }))
})

// 检查是否接近底部
const isNearBottom = () => {
    if (!containerRef.value) return false
    const { scrollTop, scrollHeight, clientHeight } = containerRef.value
    return scrollHeight - scrollTop - clientHeight < autoScrollThreshold
}

// 滚动到底部
const scrollToBottom = () => {
    if (!containerRef.value) return
    
    nextTick(() => {
        if (containerRef.value) {
            containerRef.value.scrollTop = containerRef.value.scrollHeight
        }
    })
}

// 处理滚动事件
const handleScroll = (event: Event) => {
    const target = event.target as HTMLElement
    
    // 检查是否滚动到顶部，触发加载更多
    if (target.scrollTop === 0 && props.hasMoreData && !props.isLoading) {
        loadMore()
        return
    }
    
    // 检查用户是否手动滚动
    isUserScrolling.value = !isNearBottom()
}

// 监听消息列表变化
watch(() => props.messages.length, (newCount, oldCount) => {
    if (newCount > oldCount) {
        // 如果是加载更多历史消息（从顶部加载）
        if (lastScrollHeight.value > 0) {
            // 保持滚动位置
            nextTick(() => {
                if (containerRef.value) {
                    const newContentHeight = containerRef.value.scrollHeight
                    const heightDiff = newContentHeight - lastScrollHeight.value
                    containerRef.value.scrollTop = heightDiff > 0 ? heightDiff : 0
                    lastScrollHeight.value = 0
                }
            })
        } else {
            scrollToBottom()
        }
    }
}, { flush: 'post' })

// 监听具体的消息内容变化（用于检测新消息）
watch(() => props.messages.map(m => m.content).join(''), () => {
    // 当有新的消息内容时，如果用户接近底部则自动滚动
    if (isNearBottom() || !isUserScrolling.value) {
        scrollToBottom()
    }
})

const getReactiveAvatar = computed(() => {
  // 依赖 avatarUpdateTrigger，当头像缓存更新时会重新计算
  avatarUpdateTrigger.value;
  
  return (userId: number) => {
    const avatarUrl = getAvatar(userId);
    // console.log(`响应式获取用户 ${userId} 头像:`, avatarUrl);
    return avatarUrl;
  };
});

function handleAvatarError(event: Event, userId: number) {
    const img = event.target as HTMLImageElement;
    console.warn(`用户 ${userId} 的头像加载失败，使用默认头像`);
    img.src = getAvatar(0); // 使用默认头像
}

function retryMessage(message: Comment | Explanation) {
    //   console.log("触发重试事件:", message);
    emit('retry-message', message);
}

function loadMore() {
    // 记录当前滚动高度，用于后续恢复位置
    if (containerRef.value) {
        lastScrollHeight.value = containerRef.value.scrollHeight;
    }
    
    // 触发加载更多
    emit('load-more');
}


// 格式化时间
function formatTime(timestamp: string): string {
    if (!timestamp) return ''

    const date = new Date(timestamp)
    const today = new Date()

    // 今天的消息只显示时间
    if (date.toDateString() === today.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    // 其他日期显示完整日期和时间
    return date.toLocaleString([], {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    })
}

onMounted(() => {
    scrollToBottom()
})

const systemNotification = '系统提示：直播内容及互动评论严禁传播违法或不良信息，如有违反，平台将采取封禁措施。'
</script>


<style scoped>
/* 系统提示样式 */
.system-notification {
    background-color: #2b2f38;
    border-radius: 6px;
    padding: 8px 8px 8px 8px;
    margin: 10px 10px 10px 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.notification-content {
    display: flex;
    color: #f2f2f2;
    align-items: center;
    font-size: 14px;
    line-height: 1.5;
}

.discussion-tab {
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow-y: auto;
    max-height: 100%;
    scroll-behavior: smooth;
    
    /* 隐藏滚动条 */
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.discussion-tab::-webkit-scrollbar {
    display: none;
}

.loading-more {
    text-align: center;
    padding: 8px;
    color: #888;
    font-size: 14px;
}

.message-item {
    display: flex;
    align-items: center;
}

.message-left,
.message-right {
    display: flex;
    align-items: flex-start;
    width: 100%;
    /* 确保消息占满整个宽度 */
}

/* 对于他人消息，头像在左侧，内容居中 */
.message-left {
    flex-direction: row;
    justify-content: flex-start;
}

/* 对于自己的消息，头像在右侧，内容居中 */
.message-right {
    flex-direction: row;
    justify-content: flex-end;
}

/* 修改消息内容样式，使其成为中间部分 */
.message-content {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    /* 让消息内容填充可用空间 */
    max-width: calc(100% - 80px);
    /* 给头像留出空间 */
}


/* 头像样式 */
.avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    flex-shrink: 0;
    margin: 0 8px;
}

.meta {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #888888;
}

.self-meta {
    display: flex;
    justify-content: space-between;
    color: #888888;
    font-size: 12px;
}

/* 气泡宽度适当 */
.bubble {
    background-color: #f2f2f2;
    padding: 6px 10px;
    border-radius: 10px;
    max-width: 100%;
    word-wrap: break-word;
    align-self: flex-start;
    font-size: 14px;
    color: #000000;
}

/* 自己消息的气泡和元信息对齐方式 */
.self-bubble {
    background-color: #9cc5e7;
    align-self: flex-end;
}

.bubble.sending {
    opacity: 0.8;
}

.bubble.error {
    border: 1px solid #ff4d4f;
}

.status-indicator {
    font-size: 12px;
    color: #888;
    margin-left: 5px;
    font-style: italic;
}

.error-indicator {
    font-size: 12px;
    color: #ff4d4f;
    margin-left: 5px;
}

.error-actions {
    display: flex;
    align-items: center;
    margin-top: 4px;
}

.retry-button {
    background: #ff4d4f;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 2px 8px;
    margin-left: 8px;
    font-size: 12px;
    cursor: pointer;
    transition: background 0.2s;
}

.retry-button:hover {
    background: #ff7875;
}

.load-more-container {
    display: flex;
    justify-content: center;
    margin: 10px 0;
}

.load-more-button {
    background-color: #f0f2f5;
    border: none;
    border-radius: 20px;
    padding: 8px 20px;
    font-size: 14px;
    color: #333;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 140px;
    transition: background-color 0.2s;
}

.load-more-button:hover {
    background-color: #e4e6eb;
}

.load-more-button:disabled {
    cursor: not-allowed;
    opacity: 0.7;
}

.loading-gif {
    width: 20px;
    height: 20px;
    margin-right: 5px;
}

</style>