<template>
    <div class="file-tab" ref="containerRef" @scroll="handleScroll">
        <!-- 系统提示区域 -->
        <div class="system-notification">
            <div class="notification-content">
                <span>{{ systemNotification }}</span>
            </div>
        </div>

        <!-- 加载更多按钮 - 放在顶部 -->
        <div v-if="hasMoreData" class="load-more-container">
            <button class="load-more-button" @click="loadMore" :disabled="isLoading">
                <img v-if="isLoading" src="../../assets/loading.gif" alt="加载中..." class="loading-gif" />
                <span v-else>上滑加载更多文件</span>
            </button>
        </div>

        <!-- 文件列表 -->
        <div v-for="file in formattedFiles" :key="file.id" class="file-item">
            <div :class="['file-bubble', file.isSelf ? 'self' : 'other']">
                <!-- 他人文件消息（左侧） -->
                <div v-if="!file.isSelf" class="file-left">
                    <img class="avatar" :src="getReactiveAvatar(file.uploader.id ?? 0)"
                        @error="handleAvatarError($event, file.uploader.id ?? 0)" alt="avatar" />
                    <div class="file-content">
                        <div class="meta">
                            <span class="name">{{ file.uploader.name }}</span>
                            <span class="time">{{ file.timestamp }}</span>
                        </div>
                        <div class="bubble">
                            <img class="file-icon" :src="getFileIcon(file.url)" alt="file icon" />
                            <div class="file-info">
                                <div class="file-name">{{ getFileName(file.url) }}</div>
                                <div class="file-size" v-if="file.size">{{ formatFileSize(file.size) }}</div>
                            </div>
                            <button class="download-btn" @click="downloadFile(file.url)">下载</button>
                        </div>
                    </div>
                </div>

                <!-- 自己文件消息（右侧） -->
                <div v-else class="file-right">
                    <div class="file-content">
                        <div class="meta self-meta">
                            <span class="time">{{ file.timestamp }}</span>
                            <span class="name">{{ file.uploader.name }}</span>
                        </div>
                        <div class="bubble self-bubble">
                            <img class="file-icon" :src="getFileIcon(file.url)" alt="file icon" />
                            <div class="file-info">
                                <div class="file-name">{{ getFileName(file.url) }}</div>
                                <div class="file-size" v-if="file.size">{{ formatFileSize(file.size) }}</div>
                            </div>
                            <button class="download-btn" @click="downloadFile(file.url)">下载</button>
                        </div>
                    </div>
                    <img class="avatar" :src="getReactiveAvatar(file.uploader.id ?? 0)"
                        @error="handleAvatarError($event, file.uploader.id ?? 0)" alt="avatar" />
                </div>
            </div>
        </div>

        <!-- 无内容提示 -->
        <div v-if="!isLoading && formattedFiles.length === 0" class="empty-state">
            <span>暂无文件</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, computed, watch, nextTick, onMounted } from 'vue';
import type { File } from '../../api';
import { getAvatar, avatarUpdateTrigger } from '../../avatarCache'; // 引入头像缓存工具

const fileIcons = import.meta.glob('../../assets/icon/*.svg');

// 接收父组件传入的文件消息和用户ID
const props = defineProps({
    files: {
        type: Array as () => File[],
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
});

const emit = defineEmits(['load-more']);
const containerRef = ref<HTMLElement | null>(null);
const lastScrollHeight = ref(0)
const isUserScrolling = ref(false)
const autoScrollThreshold = 100

// 自动滚动相关函数
const isNearBottom = () => {
    if (!containerRef.value) return false
    const { scrollTop, scrollHeight, clientHeight } = containerRef.value
    return scrollHeight - scrollTop - clientHeight < autoScrollThreshold
}

const scrollToBottom = () => {
    if (!containerRef.value) return

    nextTick(() => {
        if (containerRef.value) {
            containerRef.value.scrollTop = containerRef.value.scrollHeight
        }
    })
}

const handleScroll = (event: Event) => {
    const target = event.target as HTMLElement

    if (target.scrollTop === 0 && props.hasMoreData && !props.isLoading) {
        loadMore()
        return
    }

    isUserScrolling.value = !isNearBottom()
}

// 将API格式的文件数据转换为组件期望的格式
const formattedFiles = computed(() => {
    return props.files.map(file => ({
        id: file.file_id,
        isSelf: file.creator_user_id === props.currentUserId,
        uploader: {
            id: file.creator_user_id,
            name: file.creator_user_id === props.currentUserId ? '我' : `用户${file.creator_user_id}`
        },
        timestamp: formatTime(file.created_at),
        url: file.file_url,
        size: file.file_size || 0
    }));
});

// 监听文件列表变化
watch(() => props.files.length, (newCount, oldCount) => {
    if (newCount > oldCount) {
        if (lastScrollHeight.value > 0) {
            nextTick(() => {
                if (containerRef.value) {
                    const newContentHeight = containerRef.value.scrollHeight
                    const heightDiff = newContentHeight - lastScrollHeight.value
                    containerRef.value.scrollTop = heightDiff > 0 ? heightDiff : 0
                    lastScrollHeight.value = 0
                }
            })
        } else {
            nextTick(() => {
                if (!isUserScrolling.value || isNearBottom()) {
                    scrollToBottom()
                    isUserScrolling.value = false
                }
            })
        }
    }
}, { flush: 'post' })

// 加载更多函数
function loadMore() {
    if (containerRef.value) {
        lastScrollHeight.value = containerRef.value.scrollHeight;
    }
    emit('load-more');
}

const getReactiveAvatar = computed(() => {
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
    img.src = getAvatar(0);
}


// 格式化文件大小
function formatFileSize(size: number): string {
    if (!size) return '';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

// 从URL中提取文件名
function getFileName(url: string): string {
    if (!url) return '未命名文件';

    try {
        // 尝试从URL中提取文件名
        const parts = url.split('/');
        const fileName = parts[parts.length - 1];
        return decodeURIComponent(fileName) || '未命名文件';
    } catch (error) {
        return '未命名文件';
    }
}

// 根据文件后缀获取对应的图标路径
function getFileIcon(url: string): string {
    if (!url) return new URL(`../../assets/icon/default_file.svg`, import.meta.url).href;

    const extension = url.split('.').pop()?.toLowerCase(); // 获取文件后缀
    if (!extension) {
        // 如果没有后缀，返回默认图标
        return new URL(`../../assets/icon/default_file.svg`, import.meta.url).href;
    }

    // 检查是否存在对应后缀的图标
    const iconPath = `../../assets/icon/file_type_${extension}.svg`;
    if (fileIcons[iconPath]) {
        // 如果存在，返回图标路径
        return new URL(iconPath, import.meta.url).href;
    }

    // 如果图标不存在，返回默认图标
    return new URL(`../../assets/icon/default_file.svg`, import.meta.url).href;
}

// 下载文件
function downloadFile(url: string): void {
    if (!url) return;

    const link = document.createElement('a');
    link.href = url;
    link.download = getFileName(url);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.click();
}

// 格式化时间
function formatTime(timestamp: string): string {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const today = new Date();

    // 今天的消息只显示时间
    if (date.toDateString() === today.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // 其他日期显示完整日期和时间
    return date.toLocaleString([], {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

const systemNotification = '系统提示：上传的文件仅用于学习交流，请勿上传违法或侵权内容。';
</script>

<style scoped>
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

.file-tab {
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow-y: auto;
    max-height: 100%;
    scroll-behavior: smooth;

    /* 隐藏滚动条 - 兼容所有浏览器 */
    scrollbar-width: none;
    /* Firefox */
    -ms-overflow-style: none;
    /* IE 和 Edge */
}

/* WebKit 浏览器（Chrome、Safari、新版 Edge） */
.file-tab::-webkit-scrollbar {
    display: none;
}

.file-item {
    display: flex;
    align-items: center;
}

.file-bubble {
    display: flex;
    align-items: center;
    width: 100%;
}

.file-left,
.file-right {
    display: flex;
    align-items: flex-start;
    width: 100%;
}

.file-left {
    flex-direction: row;
    justify-content: flex-start;
}

.file-right {
    flex-direction: row;
    justify-content: flex-end;
}

.file-content {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    max-width: calc(100% - 80px);
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

.bubble {
    display: flex;
    align-items: center;
    background-color: #f2f2f2;
    padding: 10px;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: relative;
    max-width: 100%;
}

/* 自己消息的气泡和元信息对齐方式 */
.self-bubble {
    background-color: #9cc5e7;
}


.file-icon {
    width: 36px;
    height: 36px;
    margin-right: 10px;
}

.file-info {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    margin-right: 10px;
}

.file-name {
    font-size: 14px;
    font-weight: bold;
    color: #333;
    margin-bottom: 4px;
    overflow-wrap: break-word;
    flex-grow: 1;
}

.file-size {
    font-size: 12px;
    color: #888;
}

.avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    flex-shrink: 0;
    margin: 0 8px;
}

.download-btn {
    margin-left: auto;
    background-color: #1976d2;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
}

.download-btn:hover {
    background-color: #1565c0;
}

/* 加载更多按钮样式 */
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