const avatarCache = new Map<number, string>();
import defaultAvatar from '@/assets/avatar/default.svg';

/**
 * 获取用户头像 URL，优先从缓存中获取
 * 如果缓存中没有，则预加载头像并存入缓存
 * @param userId 用户 ID
 * @returns 头像 URL
 */
export function getAvatar(userId: number): string {
  if (avatarCache.has(userId)) {
    return avatarCache.get(userId)!; // 从缓存中获取头像 URL
  }

  // 如果缓存中没有，生成头像 URL
  const avatarUrl = `@/assets/avatar/${userId}.svg`; // 指向 public 目录中的头像文件

  // 预加载头像图片
  const img = new Image();
  img.src = avatarUrl;
  img.onload = () => {
    // 图片加载完成后存入缓存
    avatarCache.set(userId, avatarUrl);
    console.log(`Avatar for user ${userId} has been cached.`);
  };
  img.onerror = () => {
    console.error(`Failed to load avatar for user ${userId}: ${avatarUrl}`);
    avatarCache.set(userId, defaultAvatar); // 使用默认头像
    console.log(`Default avatar for user ${userId} has been cached.`);
  };

  // 返回生成的头像 URL（即使尚未加载完成）
  return avatarUrl;
}