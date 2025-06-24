// index.js
Page({
  data: {
    activeTab: 'transactions', // 默认显示收支记录标签页
    inout: ['支出', '收入'],
    inoutmapper: {'expense': "支出", 'income': "收入", 'all': '全部', '支出': "expense", '收入': "income", '全部': 'all'},
    totalIncome: 0,
    totalExpense: 0,
    netWorth: 0,
    cashFlow: 0,
    totalnetWorth: 0,
    newTransaction: {
      type: 'expense',
      category: '',
      amount: '',
      description: '',
      date: ''
    },
    newAsset: {
      name: '',
      value: ''
    },
    newLiability: {
      name: '',
      value: ''
    },
    transactiondateRange: {
      start: '',
      end: ''
    },
    dateRange: {
      start: '',
      end: ''
    },
    filterCategory: 'all',
    inoutfilterCategory: 'all',
    monthinoutfilterCategory: 'all',
    isLoading: false,
    filteredTransactions: [],
    assets: [],
    liabilities: [],
    isAdding: false,
    categoryOptions: ['餐饮', '购物', '交通', '住房', '娱乐', '医疗', '教育', '投资', '工资', '奖金', '其他']
  },

  switchTab(e) {
    this.setData({
      activeTab: e.currentTarget.dataset.tab
    });
  },

  // 类型选择
  onTypeChange(e) {
    this.setData({
      'newTransaction.type': this.data.inout[e.detail.value] === '收入'?"income":"expense"
    });
  },

  // 分类选择
  onCategoryChange(e) {
    this.setData({
      'newTransaction.category': this.data.categoryOptions[e.detail.value]
    });
  },

  // 金额输入
  onAmountChange(e) {
    this.setData({
      'newTransaction.amount': e.detail.value
    });
  },

  // 日期选择
  onDateChange(e) {
    this.setData({
      'newTransaction.date': e.detail.value
    });
  },

  // 描述输入
  onDescriptionChange(e) {
    this.setData({
      'newTransaction.description': e.detail.value
    });
  },

  // 开始日期选择
  onStartDateChange(e) {
    this.setData({
      'transactiondateRange.start': e.detail.value
    });
    this.filterTransactions();
  },

  // 结束日期选择
  onEndDateChange(e) {
    this.setData({
      'transactiondateRange.end': e.detail.value
    });
    this.filterTransactions();
  },

  // 收支类型筛选
  onInoutFilterChange(e) {
    this.setData({
      inoutfilterCategory: e.detail.value==="0"?"all":this.data.inoutmapper[this.data.inout[e.detail.value-1]]
    });
    console.log(this.data.inoutfilterCategory)
    this.filterTransactions();
  },

  // 分类筛选
  onCategoryFilterChange(e) {
    this.setData({
      filterCategory: e.detail.value==='0'?'all':this.data.categoryOptions[e.detail.value-1]
    });
    this.filterTransactions();
  },

  // 添加交易
  addTransaction() {
    this.setData({ isAdding: true });
    const transaction = this.data.newTransaction;
    const amount = parseFloat(transaction.amount);
    const c = transaction.date
    const cate = transaction.category

    if (isNaN(amount)) {
      wx.showToast({
        title: '请输入有效的金额',
        icon: 'none'
      });
      this.setData({ isAdding: false });
      return;
    }

    if (c==='') {
      wx.showToast({
        title: '请选择日期',
        icon: 'none'
      });
      this.setData({ isAdding: false });
      return;
    }

    if (cate==='') {
      wx.showToast({
        title: '请选类目',
        icon: 'none'
      });
      this.setData({ isAdding: false });
      return;
    }

    const transactions = [...this.data.transactions, {
      id: Date.now(),
      type: transaction.type,
      category: transaction.category,
      amount: amount,
      description: transaction.description,
      date: transaction.date
    }];

    // 更新数据
    this.setData({
      transactions,
      filteredTransactions: transactions,
      newTransaction: {
        type: 'expense',
        category: '',
        amount: '',
        description: '',
        date: ''
      },
      isAdding: false
    });
    this.updateFinancialSummary();
  },

  // 删除交易
  deleteTransaction(e) {
    const id = e.currentTarget.dataset.id;
    const transactions = this.data.transactions.filter(t => t.id !== id);
    this.setData({
      transactions,
      filteredTransactions: transactions.filter(t => 
        (this.data.filterCategory === 'all' || t.category === this.data.filterCategory) &&
        (this.data.inoutfilterCategory === 'all' || 
          (this.data.inoutfilterCategory === '收入' && t.type === 'income') ||
          (this.data.inoutfilterCategory === '支出' && t.type === 'expense'))
      )
    });
    this.updateFinancialSummary();
  },

  // 添加资产
  addAsset() {
    const asset = this.data.newAsset;
    const value = parseFloat(asset.value);

    if (isNaN(value)) {
      wx.showToast({
        title: '请输入有效的价值',
        icon: 'none'
      });
      return;
    }

    const assets = [...this.data.assets, { id: Date.now(), name: asset.name, value: value }];
    this.setData({ assets, newAsset: { name: '', value: '' } });
    this.updateFinancialSummary();
  },

  // 删除资产
  deleteAsset(e) {
    const id = e.currentTarget.dataset.id;
    const assets = this.data.assets.filter(a => a.id !== id);
    this.setData({ assets });
    this.updateFinancialSummary();
  },

  // 添加负债
  addLiability() {
    const liability = this.data.newLiability;
    const value = parseFloat(liability.value);

    if (isNaN(value)) {
      wx.showToast({
        title: '请输入有效的金额',
        icon: 'none'
      });
      return;
    }

    const liabilities = [...this.data.liabilities, { id: Date.now(), name: liability.name, value: value }];
    this.setData({ liabilities, newLiability: { name: '', value: '' } });
    this.updateFinancialSummary();
  },

  // 删除负债
  deleteLiability(e) {
    const id = e.currentTarget.dataset.id;
    const liabilities = this.data.liabilities.filter(l => l.id !== id);
    this.setData({ liabilities });
    this.updateFinancialSummary();
  },

  // 清空筛选
  clearFilters() {
    this.setData({
      dateRange: { start: '', end: '' },
      monthinoutfilterCategory: 'all'
    });
    this.loadMonthlyData();
  },

  // 筛选交易
  filterTransactions() {
    const { transactions, filterCategory, inoutfilterCategory } = this.data;
    let filteredTransactions = transactions;

    if (filterCategory !== 'all') {
      filteredTransactions = filteredTransactions.filter(t => t.category === filterCategory);
    }

    if (inoutfilterCategory !== 'all') {
      filteredTransactions = filteredTransactions.filter(t => 
        (inoutfilterCategory === '收入' && t.type === 'income') ||
        (inoutfilterCategory === '支出' && t.type === 'expense')
      );
    }

    this.setData({ filteredTransactions });
  },

  // 更新财务概览
  updateFinancialSummary() {
    const { transactions, assets, liabilities } = this.data;
    
    // 计算总收入和总支出
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    
    // 计算总资产和总负债
    const totalAssets = assets.reduce((sum, a) => sum + (parseFloat(a.value) || 0), 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0);
    
    // 计算净资产和现金流
    const netWorth = totalAssets - totalLiabilities;
    const cashFlow = totalIncome - totalExpense;
    const totalnetWorth = netWorth + cashFlow;
    
    this.setData({
      totalIncome,
      totalExpense,
      netWorth,
      cashFlow,
      totalnetWorth,
      totalAssets,
      totalLiabilities
    });
  },

  // 加载交易数据
  loadTransactions() {
    this.setData({ isLoading: true });
    // 模拟API请求
    setTimeout(() => {
      const transactions = [
        { id: 1, date: '2025-01-01', type: 'income', category: '工资', amount: 10000, description: '1月工资' },
        { id: 2, date: '2025-01-05', type: 'expense', category: '餐饮', amount: 300, description: '午餐' },
        { id: 3, date: '2025-01-10', type: 'expense', category: '购物', amount: 500, description: '购物' }
      ];
      this.setData({ transactions, isLoading: false });
      this.filterTransactions();
      this.updateFinancialSummary();
    }, 1000);
  },

  // 加载资产数据
  loadAssets() {
    // 模拟API请求
    setTimeout(() => {
      const assets = [
        { id: 1, name: '银行存款', value: 50000 },
        { id: 2, name: '投资', value: 100000 }
      ];
      this.setData({ assets });
      this.updateFinancialSummary();
    }, 1000);
  },

  // 加载负债数据
  loadLiabilities() {
    // 模拟API请求
    setTimeout(() => {
      const liabilities = [
        { id: 1, name: '信用卡欠款', value: 5000 },
        { id: 2, name: '贷款', value: 20000 }
      ];
      this.setData({ liabilities });
      this.updateFinancialSummary();
    }, 1000);
  },

  // 加载财务概览
  loadFinancialSummary() {
    // 模拟API请求
    setTimeout(() => {
      this.updateFinancialSummary();
    }, 1000);
  },

  // 加载月度收益趋势
  loadMonthlyData() {
    // 模拟API请求
    setTimeout(() => {
      // 这里可以添加显示图表的逻辑
    }, 1000);
  },

  // 加载资产负债图表
  loadBalanceChart() {
    // 模拟API请求
    setTimeout(() => {
      // 这里可以添加显示图表的逻辑
    }, 1000);
  },

  // 页面加载时初始化数据
  onLoad() {
    this.loadTransactions();
    this.loadAssets();
    this.loadLiabilities();
    this.loadFinancialSummary();
  }
});