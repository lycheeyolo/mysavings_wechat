// index.js
Page({
  data: {
    activeTab: 'transactions',
    newTransaction: {
      type: 'expense',
      category: '',
      amount: '',
      description: '',
      date: ''
    },
    categories :[
      '餐饮', '购物', '交通', '住房', '娱乐', 
      '医疗', '教育', '投资', '工资', '奖金', '其他'
    ],
    transactions: []
  },
  onTypeChange(e) {
    this.setData({
      'newTransaction.type': e.detail.value
    })
  },
})
