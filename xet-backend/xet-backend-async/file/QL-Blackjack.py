from collections import defaultdict
import gymnasium as gym
import numpy as np

class BlackjackAgent:
    def __init__(self, learning_rate=0.1, epsilon=0.2, discount_factor=0.9):
        """
        初始化21点代理
        learning_rate: 学习率
        epsilon: ε-贪婪策略的探索率
        discount_factor: 折扣因子
        """
        self.learning_rate = learning_rate
        self.epsilon = epsilon
        self.discount_factor = discount_factor
        # Q表：状态-动作值函数
        self.q_table = defaultdict(lambda: defaultdict(float))
        
    def get_action(self, observation, training=True):
        """
        根据当前观察选择动作
        observation: (player_sum, dealer_card, usable_ace)
        """
        if training and np.random.random() < self.epsilon:
            # ε-贪婪策略：随机探索
            return np.random.choice([0, 1])  # 0=stick, 1=hit
        else:
            # 贪婪策略：选择Q值最大的动作
            q_values = self.q_table[observation]
            if not q_values:
                return np.random.choice([0, 1])
            return max(q_values, key=lambda a: q_values[a])
    
    def update_q_table(self, state, action, reward, next_state=None, done=True):
        """
        使用Q-learning更新Q表
        """
        current_q = self.q_table[state][action]
        
        if done:
            # 终止状态，没有下一状态
            td_target = reward
        else:
            # 计算下一状态的最大Q值
            next_q_values = self.q_table[next_state]
            max_next_q = max(next_q_values.values()) if next_q_values else 0
            td_target = reward + self.discount_factor * max_next_q
        
        # Q-learning更新规则
        self.q_table[state][action] = current_q + self.learning_rate * (td_target - current_q)
    
    def train(self, episodes=1000000):
        """
        训练代理
        """
        from tqdm import tqdm
        
        env = gym.make('Blackjack-v1')

        for episode in tqdm(range(episodes)):
            observation, info = env.reset()
            done = False
            
            while not done:
                action = self.get_action(observation, training=True)
                next_observation, reward, terminated, truncated, info = env.step(action)
                done = terminated or truncated
                
                # 更新Q表
                self.update_q_table(observation, action, reward, next_observation, done)
                observation = next_observation
            
            # 可选：调整探索率
            # if episode % 1000 == 0:
                # print(f"Episode {episode}, Q-table size: {len(self.q_table)}")
        
        env.close()
    
    def test(self, episodes=1000):
        """
        测试代理性能
        """
        from tqdm import tqdm

        env = gym.make('Blackjack-v1')
        wins = 0
        total_reward = 0

        for episode in tqdm(range(episodes)):
            observation, info = env.reset()
            episode_reward = 0.0
            done = False
            
            while not done:
                action = self.get_action(observation, training=False)
                observation, reward, terminated, truncated, info = env.step(action)
                done = terminated or truncated
                episode_reward += reward
            
            total_reward += episode_reward
            if episode_reward > 0:
                wins += 1
        
        env.close()
        
        win_rate = wins / episodes
        avg_reward = total_reward / episodes
        
        print(f"测试结果 - 胜率: {win_rate:.2%}, 平均奖励: {avg_reward:.3f}")
        return win_rate, avg_reward

# 使用示例
if __name__ == "__main__":
    # 创建代理
    agent = BlackjackAgent(learning_rate=0.1, epsilon=0.1, discount_factor=1.0)
    
    # 训练代理
    print("开始训练...")
    agent.train(episodes=10000000)

    
    # 测试代理
    print("开始测试...")
    agent.test(episodes=10000)