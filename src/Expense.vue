<template>
  <div class="expense-tracker-container dark:bg-gray-800 text-white">
    <div class="m-8 min-w-[300px] max-w-[1200px] flex flex-col gap-4">
      <h1 class="text-4xl text-center">Expense Tracker</h1>
      <div class="flex gap-4">
        <!-- Add Expense Section -->
        <div class="flex-1">
          <div>
            <label for="expenseName" class="block mb-1">Item:</label>
            <input type="text" id="expenseName" class="border border-gray-300 p-2 rounded w-full dark:bg-gray-700 dark:text-white" v-model="expenseName" placeholder="Expense Name">
          </div>
          <div class="mt-4">
            <label for="selectedCategory" class="block mb-1">Category:</label>
            <select id="selectedCategory" class="border border-gray-300 p-2 rounded w-full dark:bg-gray-700 dark:text-white" v-model="selectedCategory">
              <option value="">All Categories</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
            </select>
          </div>
          <div class="mt-4">
            <label for="expenseAmount" class="block mb-1">Amount:</label>
            <input type="number" id="expenseAmount" class="border border-gray-300 p-2 rounded w-full dark:bg-gray-700 dark:text-white" v-model="expenseAmount" placeholder="Amount">
          </div>
          <button v-if="!editingExpense" class="bg-blue-600 text-white p-3 rounded-full mt-4 w-full" @click="addExpense">Add Expense</button>
          <button v-if="editingExpense" class="bg-green-600 text-white p-3 rounded-full mt-4 w-full" @click="updateExpense">Update Expense</button>
        </div>

        <!-- Expense List and Total Expenses -->
        <div class="flex-1">
          <div class="overflow-y-auto max-h-[400px] border border-gray-300 dark:border-gray-600 w-full">
            <table class="border-collapse border w-full">
              <thead>
                <tr class="font-bold">
                  <th class="p-2 text-center">Item</th>
                  <th class="p-2 text-center">Amount</th>
                  <th class="p-2 text-center">Date</th>
                  <th class="p-2 text-center">Category</th>
                  <th class="p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(expense, index) in filteredExpenses" :key="expense.id">
                  <td class="p-2 text-center">{{ expense.data.name }}</td>
                  <td class="p-2 text-center">₱{{ parseFloat(expense.data.amount).toFixed(2) }}</td>
                  <td class="p-2 text-center">{{ new Date(expense.data.date).toLocaleDateString() }}</td>
                  <td class="p-2 text-center">{{ expense.data.category }}</td>
                  <td class="p-2 text-center">
                    <button class="bg-yellow-500 text-white px-1 rounded" @click="editExpense(expense)"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
</svg>
</button>
                    <button class="bg-red-700 text-white px-1 rounded" @click="deleteExpense(expense.id, index)"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
</svg>
</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Total Expenses -->
          <div class="text-center">
            <h2 class="text-xl">TOTAL EXPENSES</h2>
            <p class="text-3xl font-bold">₱{{ totalExpenses }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import db from './firebase/config.js'
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';

const expenses = ref([])
const expenseName = ref('')
const expenseAmount = ref(0)
const selectedCategory = ref('')
const editingExpense = ref(null)

const categories = ref([
  { id: 'Books', name: 'Books' },
  { id: 'Tools', name: 'Tools' },
  { id: 'Games', name: 'Games' },
  // Add more categories here
])

const getExpenses = async () => {
  onSnapshot(collection(db, 'expenses'), (querySnapshot) => {
    expenses.value = querySnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }))
  })
}

const addExpense = async () => {
  const data = {
    name: expenseName.value,
    amount: expenseAmount.value,
    date: new Date().toISOString(),
    category: selectedCategory.value,
  }
  await addDoc(collection(db, 'expenses'), data)
  expenseName.value = ''
  expenseAmount.value = 0
  selectedCategory.value = ''
}

const deleteExpense = async (id, index) => {
  const confirmDelete = confirm("Are you sure you want to delete this expense with id: " + id + "?")
  if (confirmDelete) {
    await deleteDoc(doc(db, 'expenses', id))
    expenses.value.splice(index, 1)
  }
}

const editExpense = (expense) => {
  editingExpense.value = expense
  expenseName.value = expense.data.name
  expenseAmount.value = expense.data.amount
  selectedCategory.value = expense.data.category
}

const updateExpense = async () => {
  const data = {
    name: expenseName.value,
    amount: expenseAmount.value,
    category: selectedCategory.value,
  }
  await updateDoc(doc(db, 'expenses', editingExpense.value.id), data)
  expenseName.value = ''
  expenseAmount.value = 0
  selectedCategory.value = ''
  editingExpense.value = null
}

const filteredExpenses = computed(() => {
  if (selectedCategory.value === '') {
    return expenses.value
  } else {
    return expenses.value.filter(expense => expense.data.category === selectedCategory.value)
  }
})

const totalExpenses = computed(() => {
  return filteredExpenses.value.reduce((total, expense) => total + parseFloat(expense.data.amount), 0).toFixed(2)
})

onMounted(() => {
  getExpenses()
})
</script>

<style scoped>
.expense-tracker-container {
  background-color: #1a1a1a;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
  min-height: 20vh; /* Ensure it occupies the space */
  min-width: 80vw;
  margin-left: -40px;
}

.dark:bg-gray-800 {
  background-color: #1a1a1a;
}

.dark:text-white {
  color: #fff;
}

@media (max-width: 768px) {
  .expense-tracker-container {
    min-height: 100vh; /* Full height on smaller screens */
    min-width: 100vw;
  }
}
</style>
