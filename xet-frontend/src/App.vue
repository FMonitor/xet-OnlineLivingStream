<!-- src/App.vue -->
<template>
  <div id="app">
    <!-- 用户选择弹窗 -->
    <UserSelector />

    <!-- 用户状态指示器 -->
    <div v-if="liveStore.currentUser" class="current-user-indicator">
      <div class="user-badge" :style="{ backgroundColor: liveStore.currentUser.color }">
        {{ liveStore.currentUser.id }}
      </div>
      <span>{{ liveStore.currentUser.name }}</span>
      <button class="change-user-btn" @click="changeUser" title="切换用户">
        🔄
      </button>
    </div>

    <!-- 直播控制按钮 -->
    <LiveControlButton />

    <!-- 主要内容 -->
    <div class="container" v-if="!isLoading && liveStore.userSelected">
      <VideoPlayer class="video" :playback-url="liveStore.playback_url" />
      <ChatBox class="chat" :comments="liveStore.comments" :explanations="liveStore.explanations"
        :files="liveStore.files" :current-user-id="liveStore.currentUserId ?? 0" @send-error="showError" />

      <!-- 错误提示 -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>

    <!-- 加载中状态 -->
    <div v-else-if="isLoading" class="loading-container">
      <p>加载中...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import VideoPlayer from './components/VideoPlayer.vue'
import ChatBox from './components/ChatBox.vue'
import UserSelector from './components/UserSelector.vue'
import LiveControlButton from './components/LiveControlButton.vue'
import { useLiveStore } from './store'

const route = useRoute()
const liveStore = useLiveStore()

const isLoading = ref(true)
const errorMessage = ref<string>('')

// 在组件挂载时尝试恢复用户选择
onMounted(async () => {
  // 先尝试从缓存恢复用户选择
  const restored = liveStore.restoreUserFromStorage()

  if (restored) {
    // 如果恢复成功，加载直播信息
    await loadLiveData()
  } else {
    // 如果没有缓存的用户，显示选择弹窗
    isLoading.value = false
  }
})

// 监听用户选择变化
watch(() => liveStore.userSelected, async (selected) => {
  if (selected && liveStore.currentUserId) {
    await loadLiveData()
  }
})

// 监听路由变化
watch(() => route.params.liveId, async (newLiveId) => {
  if (newLiveId && liveStore.userSelected) {
    await loadLiveData()
  }
})

// 加载直播数据
async function loadLiveData() {
  const liveId = route.params.liveId as string
  if (!liveId || !liveStore.currentUserId) return

  isLoading.value = true

  try {
    // 加载直播信息
    await liveStore.loadLiveInfo(liveId)

    // 连接到WebSocket聊天室
    const connected = await liveStore.connectToChat(liveId, liveStore.currentUserId)
    if (connected) {
      console.log('WebSocket聊天室连接成功')
    } else {
      console.log('WebSocket连接失败，将使用HTTP模式')
    }
  } catch (error) {
    console.error('加载直播信息失败:', error)
    showError('加载直播信息失败，请刷新页面重试')
  } finally {
    isLoading.value = false
  }
}

// 切换用户
function changeUser() {
  liveStore.resetUserSelection()
}

// 显示错误信息
function showError(message: string) {
  errorMessage.value = message
  setTimeout(() => {
    errorMessage.value = ''
  }, 5000)
}

// 在组件卸载时清理资源
onUnmounted(() => {
  liveStore.reset()
})
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: row;
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
}

/* 添加用户状态指示器样式 */
.current-user-indicator {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  background: rgba(73, 78, 94, 0.95);
  padding: 8px 16px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  font-size: 14px;
  backdrop-filter: blur(10px);
}

.user-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 12px;
  margin-right: 8px;
}

.change-user-btn {
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 8px;
  font-size: 14px;
  padding: 2px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.change-user-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.video {
  flex: 1;
  height: 100vh;
  background: #000;
}

.chat {
  flex: 0 0 400px;
  /* 固定宽度400px */
  height: 100vh;
  background-color: #2b2f38;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
}

.error-message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 0, 0, 0.7);
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  z-index: 1000;
  animation: fadeIn 0.5s ease, fadeOut 0.5s ease 4.5s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}

/* 移动端样式优化 */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }

  .video {
    flex: 0 0 auto;
    /* 不拉伸，保持内容尺寸 */
    width: 100vw;
    /* 根据16:9比例计算高度 */
    height: 56.25vw;
    /* 100vw * 9/16 = 56.25vw */
    max-height: 50vh;
    /* 最大不超过视窗高度的50% */
  }

  .chat {
    background-color: #2b2f38;
    flex: 1;
    /* 占据剩余空间 */
    width: 100%;
    height: auto;
    /* 移除固定高度 */
    min-height: 0;
    /* 允许收缩 */
  }

  .current-user-indicator {
    top: 10px;
    right: 10px;
    font-size: 12px;
    padding: 6px 12px;
  }
}

/* 针对更小屏幕的优化 */
@media (max-width: 480px) {
  .video {
    height: 56.25vw;
    max-height: 40vh;
    /* 小屏幕上视频占比稍小 */
  }

  .current-user-indicator {
    top: 10px;
    right: 10px;
    font-size: 11px;
    padding: 4px 8px;
  }

  .user-badge {
    width: 20px;
    height: 20px;
    font-size: 10px;
  }
}

/* 针对横屏模式的优化 */
@media (max-width: 768px) and (orientation: landscape) {
  .video {
    height: 40vh;
    /* 横屏时视频高度固定为40%视窗高度 */
    max-height: 40vh;
  }

  .chat {
    background-color: #2b2f38;
    flex: 1;
    min-height: 60vh;
    /* 确保聊天区域有足够空间 */
  }
}

html,
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  height: 100%;
  width: 100%;
}
</style>