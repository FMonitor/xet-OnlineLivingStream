// src/avatarCache.ts
import { ref } from 'vue';
import { userAPI } from './api';
import defaultAvatar from '@/assets/avatar/default.svg';

const avatarCache = new Map<number, string>();
// 添加响应式触发器
const avatarUpdateTrigger = ref(0);

export async function getAvatarAsync(userId: number): Promise<string> {
  // console.log(`开始异步获取用户 ${userId} 的头像`);
  
  if (avatarCache.has(userId)) {
    // console.log(`用户 ${userId} 的头像已在缓存中:`, avatarCache.get(userId));
    return avatarCache.get(userId)!;
  }

  try {
    // console.log(`从服务器请求用户 ${userId} 的头像`);
    const avatarUrl = await userAPI.fetchUserAvatar(userId);
    // console.log(`用户 ${userId} 的头像URL:`, avatarUrl);
    
    // 验证图片是否可以加载
    const img = new Image();
    img.crossOrigin = 'anonymous'; // 添加跨域支持
    img.src = avatarUrl;
    
    return new Promise((resolve) => {
      img.onload = () => {
        // console.log(`用户 ${userId} 的头像加载成功:`, avatarUrl);
        avatarCache.set(userId, avatarUrl);
        
        // 触发响应式更新
        avatarUpdateTrigger.value++;
        
        resolve(avatarUrl);
      };
      
      img.onerror = (error) => {
        // console.error(`用户 ${userId} 的头像加载失败:`, avatarUrl, error);
        avatarCache.set(userId, defaultAvatar);
        
        // 触发响应式更新
        avatarUpdateTrigger.value++;
        
        resolve(defaultAvatar);
      };
      
      // 添加超时处理
      setTimeout(() => {
        if (!avatarCache.has(userId)) {
          // console.warn(`用户 ${userId} 的头像加载超时，使用默认头像`);
          avatarCache.set(userId, defaultAvatar);
          avatarUpdateTrigger.value++;
          resolve(defaultAvatar);
        }
      }, 5000); // 5秒超时
    });
  } catch (error) {
    // console.error(`获取用户 ${userId} 头像时发生错误:`, error);
    avatarCache.set(userId, defaultAvatar);
    avatarUpdateTrigger.value++;
    return defaultAvatar;
  }
}

export function getAvatar(userId: number): string {
  // console.log(`同步获取用户 ${userId} 的头像`);
  
  // 触发响应式依赖收集
  avatarUpdateTrigger.value;
  
  if (avatarCache.has(userId)) {
    const cachedUrl = avatarCache.get(userId)!;
    // console.log(`用户 ${userId} 的头像已在缓存中，返回:`, cachedUrl);
    return cachedUrl;
  }
  
  // console.log(`用户 ${userId} 的头像不在缓存中，开始异步加载...`);
  
  // 异步加载头像
  getAvatarAsync(userId).then((url) => {
    console.log(`用户 ${userId} 的头像异步加载完成:`, url);
  }).catch((error) => {
    // console.error(`用户 ${userId} 的头像异步加载失败:`, error);
  });
  
  return defaultAvatar;
}

// 导出响应式触发器供组件使用
export { avatarUpdateTrigger };