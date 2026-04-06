import numpy as np
import random  

class RLAgent:
    def __init__(self, actions):
        self.actions = actions  # List of possible actions (tuples)
        self.q_table = {}       # Will store state-action values
        self.alpha = 0.1        # Learning rate
        self.gamma = 0.9        # Discount factor
        self.epsilon = 0.3      # Exploration probability

    def get_state_key(self, state):
        """
        Convert state (accuracy + last_action) into a hashable key for Q-table.
        """
        return tuple(state)

    def select_action(self, state):
        """
        Choose an action using epsilon-greedy policy
        """
        state_key = self.get_state_key(state)
        if np.random.rand() < self.epsilon or state_key not in self.q_table:
            # Explore: choose random action ✅ fixed to use random.choice
            return random.choice(range(len(self.actions)))
        else:
            # Exploit: choose action with highest Q-value
            return max(self.q_table[state_key], key=self.q_table[state_key].get)

    def update(self, state, action, reward, next_state):
        """
        Update Q-table using Q-learning formula
        """
        state_key = self.get_state_key(state)
        next_key = self.get_state_key(next_state)

        if state_key not in self.q_table:
            self.q_table[state_key] = {a: 0 for a in range(len(self.actions))}
        if next_key not in self.q_table:
            self.q_table[next_key] = {a: 0 for a in range(len(self.actions))}

        max_future_q = max(self.q_table[next_key].values())
        current_q = self.q_table[state_key][action]

        # Q-learning update
        self.q_table[state_key][action] = current_q + self.alpha * (reward + self.gamma * max_future_q - current_q)