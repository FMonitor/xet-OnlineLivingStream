<!-- src/components/LiveControlButton.vue -->
<template>
    <div v-if="liveStore.isStreamer && !liveStore.isPlaybackMode" class="live-control-button"
        :class="{ 'streaming': liveStore.isStreaming, 'loading': liveStore.isStreamingLoading }">
        <button class="control-btn" :disabled="liveStore.isStreamingLoading" @click="toggleStreaming">
            <!-- 加载状态 -->
            <div v-if="liveStore.isStreamingLoading" class="loading-content">
                <div class="spinner"></div>
                <span>{{ liveStore.isStreaming ? '结束中...' : '开始中...' }}</span>
            </div>

            <!-- 正常状态 -->
            <div v-else class="button-content">
                <div class="status-indicator" :class="{ 'live': liveStore.isStreaming }"></div>
                <span>{{ liveStore.isStreaming ? '结束直播' : '开始直播' }}</span>
            </div>
        </button>

        <!-- 直播状态提示 -->
        <div v-if="liveStore.isStreaming" class="live-status">
            <span class="live-text">● 直播中</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useLiveStore } from '../store';

const liveStore = useLiveStore();

async function toggleStreaming() {
    try {
        if (liveStore.isStreaming) {
            const success = await liveStore.endStreaming();
            if (success) {
                console.log('直播已结束');
            }
        } else {
            const success = await liveStore.startStreaming();
            if (success) {
                console.log('直播已开始');
            }
        }
    } catch (error) {
        console.error('直播控制操作失败:', error);
    }
}
</script>

<style scoped>
.live-control-button {
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
}

.control-btn {
    background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
    border: none;
    border-radius: 25px;
    padding: 12px 20px;
    color: white;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
    transition: all 0.3s ease;
    min-width: 120px;
    position: relative;
    overflow: hidden;
}

.control-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #ff5252, #e53e3e);
    box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
    transform: translateY(-2px);
}

.control-btn:disabled {
    cursor: not-allowed;
    opacity: 0.7;
}

.control-btn:active:not(:disabled) {
    transform: translateY(0);
}

/* 开始直播状态 */
.live-control-button:not(.streaming) .control-btn {
    background: linear-gradient(135deg, #4CAF50, #45a049);
    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.live-control-button:not(.streaming) .control-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #45a049, #3d8b40);
    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

/* 直播中状态 */
.streaming .control-btn {
    background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% {
        box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
    }

    50% {
        box-shadow: 0 4px 25px rgba(255, 107, 107, 0.5);
    }

    100% {
        box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
    }
}

.button-content {
    display: flex;
    align-items: center;
    gap: 8px;
}

.status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: white;
    transition: all 0.3s ease;
}

.status-indicator.live {
    background: #ff4444;
    animation: blink 1s infinite;
}

@keyframes blink {

    0%,
    50% {
        opacity: 1;
    }

    51%,
    100% {
        opacity: 0.3;
    }
}

.loading-content {
    display: flex;
    align-items: center;
    gap: 8px;
}

.spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.live-status {
    background: rgba(255, 68, 68, 0.9);
    color: white;
    padding: 4px 12px;
    border-radius: 15px;
    font-size: 12px;
    font-weight: 600;
    backdrop-filter: blur(10px);
    animation: pulse-status 2s infinite;
}

@keyframes pulse-status {

    0%,
    100% {
        background: rgba(255, 68, 68, 0.9);
    }

    50% {
        background: rgba(255, 68, 68, 0.7);
    }
}

.live-text {
    display: flex;
    align-items: center;
    gap: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .live-control-button {
        top: 10px;
        left: 10px;
    }

    .control-btn {
        padding: 10px 16px;
        font-size: 13px;
        min-width: 100px;
    }
}

/* 避免与用户指示器重叠 */
@media (max-width: 480px) {
    .live-control-button {
        top: 60px;
        /* 为用户指示器留出空间 */
    }
}
</style>