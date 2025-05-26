import { userAPI } from './api';
import defaultAvatar from '@/assets/avatar/default.svg';

const avatarCache = new Map<number, string>();

/**
 * 获取用户头像 URL，优先从缓存中获取
 * 如果缓存中没有，则从服务器获取并存入缓存
 * @param userId 用户 ID
 * @returns 头像 URL，如果正在加载则返回默认头像
 */
export async function getAvatarAsync(userId: number): Promise<string> {
  if (avatarCache.has(userId)) {
    return avatarCache.get(userId)!; // 从缓存中获取头像 URL
  }

  try {
    // 从服务器获取头像 URL
    const avatarUrl = await userAPI.fetchUserAvatar(userId);
    
    // 预加载头像图片
    const img = new Image();
    img.src = avatarUrl;
    
    return new Promise((resolve) => {
      img.onload = () => {
        // 图片加载完成后存入缓存
        avatarCache.set(userId, avatarUrl);
        console.log(`Avatar for user ${userId} has been cached.`);
        resolve(avatarUrl);
      };
      
      img.onerror = () => {
        console.error(`Failed to load avatar for user ${userId}: ${avatarUrl}`);
        avatarCache.set(userId, defaultAvatar); // 使用默认头像
        console.log(`Default avatar for user ${userId} has been cached.`);
        resolve(defaultAvatar);
      };
    });
  } catch (error) {
    console.error(`Error fetching avatar for user ${userId}:`, error);
    avatarCache.set(userId, defaultAvatar);
    return defaultAvatar;
  }
}

/**
 * 同步获取用户头像 URL，如果缓存中没有则返回默认头像并异步加载
 * @param userId 用户 ID
 * @returns 头像 URL
 */
export function getAvatar(userId: number): string {
  if (avatarCache.has(userId)) {
    return avatarCache.get(userId)!;
  }
  
  // 如果缓存中没有，先返回默认头像，同时异步加载
  getAvatarAsync(userId).then(); // 异步加载但不等待结果
  return defaultAvatar;
}