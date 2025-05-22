<template>
  <div class="chat-box">

    <!-- 顶部切换按钮 -->
    <div class="chat-tabs">
      <button v-for="tab in tabs" :key="tab" :class="{ active: currentTab === tab }" @click="currentTab = tab">
        {{ tab }}
      </button>
    </div>

    <!-- 内容区域 -->
    <div class="chat-content">
      <component 
        :is="currentTabComponent" 
        :messages="currentMessages" 
        :files="currentFiles"
        :currentUserId="currentUserId" 
        :isLoading="isCurrentTabLoading"
        :hasMoreData="hasMoreCurrentTabData"
        @load-more="handleLoadMore"
        @retry-message="retryMessage" />
    </div>
    <div class="dragline" @mousedown="startDrag"></div>

    <!-- 表情 & 提问 -->
    <div class="chat-actions">
      <div class="emoji-wrapper">
        <button class="icon-button" @click="toggleEmoji">
          <font-awesome-icon icon="smile" />
        </button>
        <!-- 修改选择器位置 -->
        <emoji-picker v-if="showEmoji" class="emoji-picker-dropdown" @emoji-click="addEmoji"></emoji-picker>
      </div>

      <label class="question-toggle">
        <input type="checkbox" v-model="isQuestion" />
        <span class="custom-checkbox"></span>
        提问
      </label>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input-wrapper">
      <!-- 输入框 -->
      <textarea v-model="message" :style="{ height: inputHeight + 'px' }" placeholder="请输入您想讨论的内容"
        @keyup.enter="sendMessage" :disabled="currentTab !== '讨论'" />

      <!-- 发送按钮 -->
      <button class="send-button" @click="sendMessage" :disabled="currentTab !== '讨论' || isSending || !message.trim()">
        {{ isSending ? '发送中...' : '发送' }}
      </button>

    </div>
  </div>
</template>




<script setup lang="ts">
import ExplanationTab from './ChatTabs/ExplanationTab.vue'
import DiscussionTab from './ChatTabs/DiscussionTab.vue'
import FileTab from './ChatTabs/FileTab.vue'
import { ref, onMounted, onUnmounted, computed, watchEffect, nextTick } from 'vue'
import { useLiveStore } from '../store'
import type { Explanation, Comment, File } from '../api'
import { useRoute } from 'vue-router'

const liveStore = useLiveStore()
const route = useRoute()
const props = defineProps({
  currentUserId: {
    type: Number,
    required: true
  },
  comments: {
    type: Array,
    default: () => []
  },
  explanations: {
    type: Array,
    default: () => []
  },
  files: {
    type: Array,
    default: () => []
  }
})
const message = ref('')
const isQuestion = ref(false)
const isSending = ref(false)


const inputHeight = ref(120)
let isDragging = false
let startY = 0
let startHeight = 0
const tabs = ['讲解', '讨论', '文件']
const currentTab = ref('讲解')

const showEmoji = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const cursorPosition = ref({ start: 0, end: 0 })

// 使用计算属性从 store 中获取消息
const explanationMessages = computed(() => liveStore.explanations || [])
const discussionMessages = computed(() => liveStore.comments || [])
const fileMessages = computed(() => liveStore.files || [])
const emit = defineEmits(['send-comment', 'send-explanation', 'send-file', 'load-more-comments', 'load-more-explanations', 'load-more-files', 'send-error'])

// 定义当前要显示的组件
const currentTabComponent = computed(() => {
  return {
    '讲解': ExplanationTab,
    '讨论': DiscussionTab,
    '文件': FileTab
  }[currentTab.value]
})

// 定义当前要显示的消息
const currentMessages = computed(() => {
  if (currentTab.value === '讲解') return explanationMessages.value
  if (currentTab.value === '讨论') return discussionMessages.value
  return []
})

const currentFiles = computed(() => {
  if (currentTab.value === '文件') return fileMessages.value
  return []
})


// 格式化时间戳
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()

  // 如果是今天的消息，显示 "HH:mm"
  if (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  ) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // 如果是其他日期，显示 "YYYY-MM-DD HH:mm"
  return date.toLocaleString([], {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function updateMessageStatus(message: Comment | Explanation, sending: boolean, error: boolean) {
  if (!message) return;
  
  // 通过数组的splice方法替换对象，确保Vue能检测到变更
  if ('comment_id' in message) {
    const index = liveStore.comments.findIndex(item => item.comment_id === message.comment_id);
    if (index > -1) {
      // 创建一个新对象，保持原对象的所有属性，只更新状态
      const updatedMessage = { 
        ...message, 
        sending, 
        error 
      };
      // 用新对象替换原对象
      liveStore.comments.splice(index, 1, updatedMessage);
      console.log('消息状态已更新:', sending, error);
    }
  } else {
    const index = liveStore.explanations.findIndex(item => item.expla_id === message.expla_id);
    if (index > -1) {
      const updatedMessage = { 
        ...message, 
        sending, 
        error 
      };
      liveStore.explanations.splice(index, 1, updatedMessage);
      console.log('讲解状态已更新:', sending, error);
    }
  }
}

async function sendMessage() {
  // 如果消息为空或者只有空格，不发送
  if (!message.value.trim()) return

  // 如果正在发送中，防止重复发送
  if (isSending.value) return

  // 添加提问标签（可选）
  const tag = isQuestion.value ? '[提问] ' : ''
  const content = tag + message.value

  // 清空输入框，提高用户体验
  message.value = ''  
  isSending.value = true

  let timeoutTimer: number | undefined;
  let localMessage: Comment | Explanation | null = null;
  try {
    if (currentTab.value === '讨论') {
      // 创建本地消息对象
      localMessage = {
        comment_id: Date.now(),
        creator_user_id: props.currentUserId,
        content,
        created_at: new Date(new Date().getTime() + 8 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19),
        living_stream_id: liveStore.currentLiveId ?? 0,
        sending: true,
        error: false
      } as Comment;
      // 添加到本地消息列表
      liveStore.comments.push(localMessage)
      
      try {
        // 发送到服务器
        const success = await liveStore.addComment(content, props.currentUserId);
        
        // 成功更新状态
        updateMessageStatus(localMessage, false, !success);
        
        if (!success) {
          throw new Error('服务器返回错误，发送失败');
        }
      } catch (innerError) {
        // 网络错误，立即更新消息状态
        console.error('发送失败:', innerError);
        updateMessageStatus(localMessage, false, true);
        throw innerError; // 继续抛出错误
      }
    } else if (currentTab.value === '讲解') {
      // 创建本地讲解消息，同样的模式
      // ...类似的代码...
      localMessage = {
        expla_id: Date.now(),
        creator_user_id: props.currentUserId,
        content,
        created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
        living_stream_id: liveStore.currentLiveId ?? 0,
        sending: true,
        error: false
      } as Explanation;
      
      liveStore.explanations.push(localMessage)
      
      try {
        const success = await liveStore.addExplanation(content, props.currentUserId);
        updateMessageStatus(localMessage, false, !success);
        
        if (!success) {
          throw new Error('服务器返回错误，发送失败');
        }
      } catch (innerError) {
        updateMessageStatus(localMessage, false, true);
        throw innerError;
      }
    }
    
    // 其他代码保持不变...
  } catch (error) {
    // 清除超时计时器
    if (timeoutTimer) {
      clearTimeout(timeoutTimer)
      timeoutTimer = undefined
    }
    
    // 获取错误信息
    const errorMsg = error instanceof Error ? error.message : '发送失败，请重试'
    
    // 触发错误事件
    emit('send-error', errorMsg)
  } finally {
    isSending.value = false
  }
}

async function retryMessage(message: Comment | Explanation) {
  // console.log("重试发送消息:", message); // 添加调试日志
  
  // 判断消息类型
  const isComment = 'comment_id' in message;
  const messageContent = message.content;
  
  // 设置消息为"发送中"状态
  message.sending = true;
  message.error = false;
  
  let timeoutTimer: number | undefined;
  
  try {
    // 创建超时Promise
    const timeoutPromise = new Promise<boolean>((_, reject) => {
      timeoutTimer = window.setTimeout(() => {
        reject(new Error('发送超时，请检查网络连接'))
      }, 5000) // 5秒超时
    })
    
    let sendPromise: Promise<boolean>;
    
    if (isComment) {
      // 重试评论
      sendPromise = liveStore.addComment(messageContent, props.currentUserId);
    } else {
      // 重试讲解
      sendPromise = liveStore.addExplanation(messageContent, props.currentUserId);
    }
    
    // 与超时竞争
    const success = await Promise.race([sendPromise, timeoutPromise]);
    
    // 清除超时计时器
    if (timeoutTimer) clearTimeout(timeoutTimer);
    
    // 更新消息状态
    message.sending = false;
    
    if (!success) {
      message.error = true;
      throw new Error('服务器返回错误，发送失败');
    }
    
    console.log(isComment ? '评论重试成功' : '讲解重试成功');
  } catch (error) {
    // 清除超时计时器
    if (timeoutTimer) clearTimeout(timeoutTimer);
    
    // 更新消息状态
    message.sending = false;
    message.error = true;
    
    // 获取错误信息
    const errorMsg = error instanceof Error ? error.message : '发送失败，请重试';
    
    // 触发错误事件
    emit('send-error', errorMsg);
  }
}

// 根据当前选中的Tab返回对应的hasMoreData
const hasMoreCurrentTabData = computed(() => {
  if (currentTab.value === '讨论') {
    return liveStore.hasMoreComments;
  } else if (currentTab.value === '讲解') {
    return liveStore.hasMoreExplanations;
  } else if (currentTab.value === '文件') {
    return liveStore.hasMoreFiles;
  }
  return false;
});

// 同样添加一个计算属性来跟踪加载状态
const isCurrentTabLoading = computed(() => {
  if (currentTab.value === '讨论') {
    return liveStore.isLoadingComments;
  } else if (currentTab.value === '讲解') {
    return liveStore.isLoadingExplanations;
  } else if (currentTab.value === '文件') {
    return liveStore.isLoadingFiles;
  }
  return false;
});

function handleLoadMore() {
  if (currentTab.value === '讨论') {
    liveStore.loadMoreComments();
  } else if (currentTab.value === '讲解') {
    liveStore.loadMoreExplanations();
  } else if (currentTab.value === '文件') {
    liveStore.loadMoreFiles();
  }
}

// 保存光标位置的函数
const saveCursorPosition = () => {
  if (textareaRef.value) {
    cursorPosition.value = {
      start: textareaRef.value.selectionStart || 0,
      end: textareaRef.value.selectionEnd || 0
    }
  }
}


// 修改表情切换函数，保存当前光标位置
function toggleEmoji() {
  // 在切换表情选择器之前保存当前光标位置
  saveCursorPosition()
  showEmoji.value = !showEmoji.value
}

// 添加表情到输入框
const addEmoji = (event: CustomEvent) => {
  const emoji = event.detail.unicode

  if (textareaRef.value) {
    // 获取保存的光标位置
    const { start, end } = cursorPosition.value

    // 在光标位置插入表情
    const before = message.value.substring(0, start)
    const after = message.value.substring(end)
    message.value = before + emoji + after

    // 重新设置光标位置
    nextTick(() => {
      textareaRef.value!.focus()
      const newPosition = start + emoji.length
      textareaRef.value!.setSelectionRange(newPosition, newPosition)

      // 更新保存的光标位置
      cursorPosition.value = { start: newPosition, end: newPosition }
    })
  } else {
    // 如果没有引用到文本框，则附加到末尾
    message.value += emoji

    // 尝试聚焦文本框
    const textarea = document.querySelector('.chat-input-wrapper textarea')
    if (textarea) {
      (textarea as HTMLTextAreaElement).focus()
    }
  }
}

const handleClickOutside = (event: MouseEvent) => {
  const picker = document.querySelector('emoji-picker')
  const button = (event.target as HTMLElement)?.closest('button')
  if (picker && !picker.contains(event.target as Node) && !button) {
    showEmoji.value = false
  }
}

// 拖拽文本输入
const startDrag = (e: MouseEvent) => {
  e.preventDefault() // 防止文本选择
  isDragging = true
  startY = e.clientY
  startHeight = inputHeight.value
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.body.style.cursor = 'ns-resize' // 改变整个页面的光标
}

const onDrag = (e: MouseEvent) => {
  if (isDragging) {
    // 计算移动差值：向上拖动为负值，应该减小输入框高度
    const diff = e.clientY - startY

    const newHeight = Math.max(120, Math.min(600, startHeight - diff))
    inputHeight.value = newHeight
  }
}

const stopDrag = () => {
  isDragging = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.body.style.cursor = '' // 恢复默认光标
}

// 确保组件卸载时清理事件监听器
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  // 获取直播ID并加载数据
  const liveId = route.params.liveId as string
  if (liveId && (!liveStore.currentLiveId || liveStore.currentLiveId.toString() !== liveId)) {
    // 如果直播ID存在且与当前store中不同，加载新的直播信息
    liveStore.loadLiveInfo(liveId)
      .then(() => {
        console.log('直播信息加载成功')
      })
      .catch(error => {
        console.error('加载直播信息失败:', error)
      })
  }
})


onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.chat {
  background-color: #2b2f38;
  width: 360px;
}

.chat-box {
  padding: 0px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-tabs {
  display: flex;
  height: 44px;
}

.chat-tabs button {
  flex: 1;
  padding: 6px;
  font-size: 14px;
  background: #2b2f38;
  color: #888888;
  border: none;
  cursor: pointer;
}

.chat-tabs button.active {
  background: #2b2f38;
  color: rgb(255, 255, 255);
  border-bottom: 2px solid #cfcfcf;
  /* 添加底部横线 */

}

.chat-content {
  flex: 1;
  overflow-y: auto;
  background: #16161b;
  margin-bottom: 0px;

}

.chat-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

/* 表情和提问的按钮 */
.icon-button {
  background: none;
  border: none;
  font-size: 16px;
  margin-left: 16px;
  cursor: pointer;
  color: #acacac;
  padding: 5px;
}

.icon-button:hover {
  color: #1976d2;
}

.emoji-wrapper {
  position: relative;
  display: inline-block;
}

.emoji-picker-dropdown {
  position: absolute;
  bottom: 100%;
  left: 0;
  z-index: 1000;
  margin-bottom: 10px;
  /* 添加一些间距 */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  border-radius: 8p nnx;
  overflow: hidden;
}

/* 自定义 emoji-picker 样式 */
:deep(emoji-picker) {
  --background: #2b2f38;
  --border-color: #444;
  --category-emoji-size: 1.25em;
  --emoji-size: 1em;
  --input-border-color: #555;
  --input-font-color: #eee;
  --input-placeholder-color: #aaa;
  --outline-color: #1976d2;
  --category-font-color: #eee;
  --indicator-color: #1976d2;
  /* 添加滚动条变量 */
  --scroll-background: #222;
  /* 滚动条背景 */
  --scroll-thumb-color: #444;
  /* 滚动条滑块颜色 */


  max-width: 300px;
  max-height: 300px;
}

/* 自定义滚动条样式 */
:deep(emoji-picker) ::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

:deep(emoji-picker) ::-webkit-scrollbar-track {
  background: #222;
  /* 黑色轨道背景 */
  border-radius: 4px;
}

:deep(emoji-picker) ::-webkit-scrollbar-thumb {
  background: #444;
  /* 深灰色滑块 */
  border-radius: 4px;
}

:deep(emoji-picker) ::-webkit-scrollbar-thumb:hover {
  background: #555;
  /* 悬停时稍微变亮 */
}

/* 处理 Firefox 滚动条 */
:deep(emoji-picker) * {
  scrollbar-color: #444 #222;
  /* 滑块和轨道颜色 */
  scrollbar-width: thin;
}


/* 提问 */
.question-toggle {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
  margin-right: 16px;
  color: #acacac;
}

.question-toggle input[type="checkbox"] {
  display: none;
  /* 隐藏原生复选框 */
}


.custom-checkbox {
  width: 16px;
  height: 16px;
  border: 2px solid #cfcfcf;
  border-radius: 50%;
  margin-right: 6px;
  position: relative;
  transition: all 0.2s ease;
}

.question-toggle input[type="checkbox"]:checked+.custom-checkbox::after {
  content: '';
  position: absolute;
  top: 0px;
  left: 0px;
  width: 12px;
  height: 12px;
  background: #1976d2;
  border-radius: 50%;
}

.chat-input {
  display: flex;
  gap: 6px;
}

.chat-input input {
  flex: 1;
  padding: 6px;
}

.chat-input-wrapper {
  position: relative;
  width: 100%;
  user-select: none;
}

.dragline {
  height: 6px;
  cursor: ns-resize;
  background-color: #2b2f38;
  margin-bottom: 4px;
  border-radius: 3px;
}

.chat-input-wrapper textarea {
  width: 100%;
  padding: 10px 70px 10px 10px;
  resize: none;
  font-size: 14px;
  font-family: 'Arial', sans-serif;
  border: 0px solid #ccc;
  color: #ffffff;
  background-color: #16161b;
  outline: none;
  box-sizing: border-box;
}

.send-button {
  position: absolute;
  bottom: 10px;
  right: 10px;
  padding: 6px 12px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.send-button:disabled {
  background-color: #888888;
  /* 灰色背景 */
  cursor: not-allowed;
  /* 禁用状态的光标 */
}
</style>
