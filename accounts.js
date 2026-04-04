// Account Management System for TeenzUP
// Stores accounts in localStorage (browser-based storage)

const accountManager = {
  storageKey: 'teenzup_accounts',
  
  // Get all accounts from storage
  getAllAccounts() {
    const accountsJson = localStorage.getItem(this.storageKey);
    return accountsJson ? JSON.parse(accountsJson) : {};
  },
  
  // Save all accounts to storage
  saveAccounts(accounts) {
    localStorage.setItem(this.storageKey, JSON.stringify(accounts));
  },
  
  // Check if nickname already exists
  accountExists(nickname) {
    const accounts = this.getAllAccounts();
    return accounts.hasOwnProperty(nickname.toLowerCase());
  },
  
  // Check if email already exists
  emailExists(email) {
    const accounts = this.getAllAccounts();
    return Object.values(accounts).some(account => account.email.toLowerCase() === email.toLowerCase());
  },
  
  // Create a new account
  createAccount(formData) {
    try {
      const accounts = this.getAllAccounts();
      const nicknameLower = formData.nickname.toLowerCase();
      
      // Check for duplicates
      if (accounts[nicknameLower]) {
        return false; // Nickname already exists
      }
      
      // Create account object
      const account = {
        nickname: formData.nickname,
        firstName: formData.firstName,
        familyName: formData.familyName,
        email: formData.email,
        password: formData.password, // In production, this should be hashed!
        portfolio: formData.portfolio,
        description: formData.description,
        selling: formData.selling,
        age: formData.age,
        createdAt: new Date().toISOString()
      };
      
      // Save account
      accounts[nicknameLower] = account;
      this.saveAccounts(accounts);
      
      // Also save to a readable JSON file format (for backup/viewing)
      this.exportToFile();
      
      return true;
    } catch (error) {
      console.error('Error creating account:', error);
      return false;
    }
  },
  
  // Login with nickname and password
  login(nickname, password) {
    const accounts = this.getAllAccounts();
    const nicknameLower = nickname.toLowerCase();
    const account = accounts[nicknameLower];
    
    if (account && account.password === password) {
      // Return account without password
      const { password: _, ...accountWithoutPassword } = account;
      return accountWithoutPassword;
    }
    
    return null;
  },
  
  // Get account by nickname
  getAccount(nickname) {
    const accounts = this.getAllAccounts();
    const account = accounts[nickname.toLowerCase()];
    if (account) {
      const { password: _, ...accountWithoutPassword } = account;
      return accountWithoutPassword;
    }
    return null;
  },
  
  // Export accounts to downloadable JSON file
  exportToFile() {
    try {
      const accounts = this.getAllAccounts();
      // Remove passwords for export
      const accountsWithoutPasswords = {};
      Object.keys(accounts).forEach(key => {
        const { password: _, ...accountWithoutPassword } = accounts[key];
        accountsWithoutPasswords[key] = accountWithoutPassword;
      });
      
      const dataStr = JSON.stringify(accountsWithoutPasswords, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      // Store in localStorage as backup (readable format)
      localStorage.setItem(this.storageKey + '_export', dataStr);
    } catch (error) {
      console.error('Error exporting accounts:', error);
    }
  },
  
  // Get all accounts (for admin purposes - without passwords)
  getAllAccountsSafe() {
    const accounts = this.getAllAccounts();
    const safeAccounts = {};
    Object.keys(accounts).forEach(key => {
      const { password: _, ...accountWithoutPassword } = accounts[key];
      safeAccounts[key] = accountWithoutPassword;
    });
    return safeAccounts;
  }
};

// Make accountManager available globally
window.accountManager = accountManager;
