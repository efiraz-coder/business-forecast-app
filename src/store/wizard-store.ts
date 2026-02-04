import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types
export interface Product {
  id: string
  name: string
  type: 'service' | 'physical' | 'digital'
  price: number              // מחיר יחידה
  quantity?: number          // כמות נמכרת חודשית
  variableCostRate: number
  hasInventory: boolean
  inventoryOpen?: number
  costPerUnit?: number
  minInventory?: number
}

export interface HeadcountRole {
  id: string
  name: string
  headcount: number
  avgSalary: number
  employerCostRate: number
}

export interface FixedExpense {
  id: string
  name: string
  category: 'admin' | 'finance' | 'operations'
  monthlyAmount: number
  isEnabled: boolean
}

export interface SalesForecast {
  productId: string
  month: number
  units: number
}

export interface HeadcountForecast {
  roleId: string
  month: number
  headcountChange: number
  salaryChange: number
}

export interface MarketingBudget {
  month: number
  totalBudget: number
  googlePercent: number
  facebookPercent: number
  seoPercent: number
  otherPercent: number
  hasAgency: boolean
  agencyFixedFee: number
  agencyPercentFee: number
}

export interface FinancingItem {
  id: string
  type: 'bank_fees' | 'overdraft_interest' | 'cc_fee_rate' | 'loan'
  name: string
  monthlyAmount?: number
  percentRate?: number
  principal?: number
  interestRate?: number
  startMonth?: number
  termMonths?: number
}

// Wizard state
interface WizardState {
  // Business info
  businessId: string | null
  businessName: string
  industry: string
  startDate: string
  openingBalance: number
  
  // Products
  products: Product[]
  
  // Headcount
  headcountRoles: HeadcountRole[]
  
  // Fixed expenses
  fixedExpenses: FixedExpense[]
  
  // Sales forecast
  salesForecasts: SalesForecast[]
  
  // Headcount forecast
  headcountForecasts: HeadcountForecast[]
  
  // Marketing
  marketingBudgets: MarketingBudget[]
  
  // Financing
  financingItems: FinancingItem[]
  
  // Wizard progress
  currentStep: number
  layer1Done: boolean
  layer2Done: boolean
  layer3Done: boolean
  
  // Actions
  setBusinessInfo: (name: string, industry: string, startDate: string, openingBalance: number) => void
  setBusinessId: (id: string) => void
  
  addProduct: (product: Product) => void
  updateProduct: (id: string, product: Partial<Product>) => void
  removeProduct: (id: string) => void
  
  addHeadcountRole: (role: HeadcountRole) => void
  updateHeadcountRole: (id: string, role: Partial<HeadcountRole>) => void
  removeHeadcountRole: (id: string) => void
  
  addFixedExpense: (expense: FixedExpense) => void
  updateFixedExpense: (id: string, expense: Partial<FixedExpense>) => void
  removeFixedExpense: (id: string) => void
  
  setSalesForecast: (productId: string, month: number, units: number) => void
  setHeadcountForecast: (roleId: string, month: number, change: number, salaryChange: number) => void
  setMarketingBudget: (month: number, budget: Partial<MarketingBudget>) => void
  
  addFinancingItem: (item: FinancingItem) => void
  updateFinancingItem: (id: string, item: Partial<FinancingItem>) => void
  removeFinancingItem: (id: string) => void
  
  setCurrentStep: (step: number) => void
  completeLayer: (layer: 1 | 2 | 3) => void
  
  resetWizard: () => void
}

// Default fixed expenses
const defaultFixedExpenses: FixedExpense[] = [
  { id: '1', name: 'שכירות', category: 'admin', monthlyAmount: 0, isEnabled: false },
  { id: '2', name: 'ארנונה', category: 'admin', monthlyAmount: 0, isEnabled: false },
  { id: '3', name: 'חשמל/מים', category: 'admin', monthlyAmount: 0, isEnabled: false },
  { id: '4', name: 'רכב/דלק', category: 'operations', monthlyAmount: 0, isEnabled: false },
  { id: '5', name: 'רו"ח', category: 'finance', monthlyAmount: 0, isEnabled: false },
  { id: '6', name: 'ביטוחים', category: 'admin', monthlyAmount: 0, isEnabled: false },
  { id: '7', name: 'טלפון/אינטרנט', category: 'admin', monthlyAmount: 0, isEnabled: false },
  { id: '8', name: 'תוכנות ומנויים', category: 'operations', monthlyAmount: 0, isEnabled: false },
  { id: '9', name: 'הוצאות נוספות', category: 'admin', monthlyAmount: 0, isEnabled: false },
]

// Default headcount roles
const defaultHeadcountRoles: HeadcountRole[] = [
  { id: '1', name: 'ניהול', headcount: 0, avgSalary: 0, employerCostRate: 0.175 },
  { id: '2', name: 'מזכירות/אדמין', headcount: 0, avgSalary: 0, employerCostRate: 0.175 },
  { id: '3', name: 'שיווק', headcount: 0, avgSalary: 0, employerCostRate: 0.175 },
  { id: '4', name: 'מכירות', headcount: 0, avgSalary: 0, employerCostRate: 0.175 },
  { id: '5', name: 'תפעול/ייצור', headcount: 0, avgSalary: 0, employerCostRate: 0.175 },
]

// Initial state
const initialState = {
  businessId: null,
  businessName: '',
  industry: '',
  startDate: '',
  openingBalance: 0,
  products: [],
  headcountRoles: defaultHeadcountRoles,
  fixedExpenses: defaultFixedExpenses,
  salesForecasts: [],
  headcountForecasts: [],
  marketingBudgets: [],
  financingItems: [],
  currentStep: 1,
  layer1Done: false,
  layer2Done: false,
  layer3Done: false,
}

export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setBusinessInfo: (name, industry, startDate, openingBalance) =>
        set({ businessName: name, industry, startDate, openingBalance }),
      
      setBusinessId: (id) => set({ businessId: id }),
      
      addProduct: (product) =>
        set((state) => ({ products: [...state.products, product] })),
      
      updateProduct: (id, product) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...product } : p
          ),
        })),
      
      removeProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
          salesForecasts: state.salesForecasts.filter((s) => s.productId !== id),
        })),
      
      addHeadcountRole: (role) =>
        set((state) => ({ headcountRoles: [...state.headcountRoles, role] })),
      
      updateHeadcountRole: (id, role) =>
        set((state) => ({
          headcountRoles: state.headcountRoles.map((r) =>
            r.id === id ? { ...r, ...role } : r
          ),
        })),
      
      removeHeadcountRole: (id) =>
        set((state) => ({
          headcountRoles: state.headcountRoles.filter((r) => r.id !== id),
          headcountForecasts: state.headcountForecasts.filter((h) => h.roleId !== id),
        })),
      
      addFixedExpense: (expense) =>
        set((state) => ({ fixedExpenses: [...state.fixedExpenses, expense] })),
      
      updateFixedExpense: (id, expense) =>
        set((state) => ({
          fixedExpenses: state.fixedExpenses.map((e) =>
            e.id === id ? { ...e, ...expense } : e
          ),
        })),
      
      removeFixedExpense: (id) =>
        set((state) => ({
          fixedExpenses: state.fixedExpenses.filter((e) => e.id !== id),
        })),
      
      setSalesForecast: (productId, month, units) =>
        set((state) => {
          const existing = state.salesForecasts.findIndex(
            (s) => s.productId === productId && s.month === month
          )
          if (existing >= 0) {
            const updated = [...state.salesForecasts]
            updated[existing] = { productId, month, units }
            return { salesForecasts: updated }
          }
          return { salesForecasts: [...state.salesForecasts, { productId, month, units }] }
        }),
      
      setHeadcountForecast: (roleId, month, headcountChange, salaryChange) =>
        set((state) => {
          const existing = state.headcountForecasts.findIndex(
            (h) => h.roleId === roleId && h.month === month
          )
          if (existing >= 0) {
            const updated = [...state.headcountForecasts]
            updated[existing] = { roleId, month, headcountChange, salaryChange }
            return { headcountForecasts: updated }
          }
          return {
            headcountForecasts: [
              ...state.headcountForecasts,
              { roleId, month, headcountChange, salaryChange },
            ],
          }
        }),
      
      setMarketingBudget: (month, budget) =>
        set((state) => {
          const existing = state.marketingBudgets.findIndex((m) => m.month === month)
          const defaultBudget: MarketingBudget = {
            month,
            totalBudget: 0,
            googlePercent: 0,
            facebookPercent: 0,
            seoPercent: 0,
            otherPercent: 0,
            hasAgency: false,
            agencyFixedFee: 0,
            agencyPercentFee: 0,
          }
          if (existing >= 0) {
            const updated = [...state.marketingBudgets]
            updated[existing] = { ...updated[existing], ...budget }
            return { marketingBudgets: updated }
          }
          return {
            marketingBudgets: [...state.marketingBudgets, { ...defaultBudget, ...budget }],
          }
        }),
      
      addFinancingItem: (item) =>
        set((state) => ({ financingItems: [...state.financingItems, item] })),
      
      updateFinancingItem: (id, item) =>
        set((state) => ({
          financingItems: state.financingItems.map((f) =>
            f.id === id ? { ...f, ...item } : f
          ),
        })),
      
      removeFinancingItem: (id) =>
        set((state) => ({
          financingItems: state.financingItems.filter((f) => f.id !== id),
        })),
      
      setCurrentStep: (step) => set({ currentStep: step }),
      
      completeLayer: (layer) =>
        set((state) => {
          if (layer === 1) return { layer1Done: true }
          if (layer === 2) return { layer2Done: true }
          if (layer === 3) return { layer3Done: true }
          return state
        }),
      
      resetWizard: () => set(initialState),
    }),
    {
      name: 'wizard-storage',
    }
  )
)
