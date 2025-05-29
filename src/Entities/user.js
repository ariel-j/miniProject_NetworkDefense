// Mock User Entity
class User {
  static mockUserData = {
    id: 1,
    email: 'john.doe@company.com',
    name: 'John Doe',
    role: 'Advanced Level',
    total_simulations: 23,
    successful_detections: 18,
    failed_detections: 5,
    current_streak: 7,
    best_streak: 12,
    last_training_date: new Date().toISOString(),
    completed_learning_modules: [1, 2, 4],
    created_date: '2024-01-15T10:00:00Z',
    updated_date: new Date().toISOString()
  };

  static async me() {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...this.mockUserData };
  }

  static async updateMyUserData(updates) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Update mock data
    this.mockUserData = { 
      ...this.mockUserData, 
      ...updates,
      updated_date: new Date().toISOString()
    };
    
    return { ...this.mockUserData };
  }

  static async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (id === this.mockUserData.id) {
      return { ...this.mockUserData };
    }
    throw new Error('User not found');
  }

  static async filter(criteria, orderBy = null, limit = null) {
    await new Promise(resolve => setTimeout(resolve, 300));
    // For simplicity, just return the current user
    return [{ ...this.mockUserData }];
  }

  static async create(userData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newUser = {
      id: Date.now(),
      ...userData,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString()
    };
    return newUser;
  }

  static async update(id, updates) {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (id === this.mockUserData.id) {
      this.mockUserData = {
        ...this.mockUserData,
        ...updates,
        updated_date: new Date().toISOString()
      };
      return { ...this.mockUserData };
    }
    throw new Error('User not found');
  }

  static async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (id === this.mockUserData.id) {
      return { success: true };
    }
    throw new Error('User not found');
  }
}

export { User };