'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'
import { useWizardStore, Product } from '@/store/wizard-store'
import { Package, Plus, Trash2, ArrowLeft, ArrowRight, Pencil } from 'lucide-react'

export default function Step2Page() {
  const router = useRouter()
  const { products, addProduct, updateProduct, removeProduct, setCurrentStep } = useWizardStore()

  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Form state
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')

  useEffect(() => {
    setCurrentStep(2)
  }, [setCurrentStep])

  const resetForm = () => {
    setName('')
    setPrice('')
    setQuantity('')
    setIsAdding(false)
    setEditingId(null)
  }

  const handleSave = () => {
    if (!name.trim() || !price || !quantity) return

    const product: Product = {
      id: editingId || crypto.randomUUID(),
      name: name.trim(),
      type: 'service',
      price: Number(price),
      quantity: Number(quantity),
      variableCostRate: 0,
      hasInventory: false,
    }

    if (editingId) {
      updateProduct(editingId, product)
    } else {
      addProduct(product)
    }

    resetForm()
  }

  const handleEdit = (product: Product) => {
    setEditingId(product.id)
    setName(product.name)
    setPrice(product.price.toString())
    setQuantity((product.quantity || 0).toString())
    setIsAdding(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('למחוק את המוצר/שירות?')) {
      removeProduct(id)
    }
  }

  // Calculate totals
  const totalRevenue = products.reduce((sum, p) => sum + (p.price * (p.quantity || 0)), 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>מוצרים ושירותים</CardTitle>
            <CardDescription>הגדר את המוצרים והשירותים שהעסק מציע</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Products Table */}
        {products.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-right">שם</TableHead>
                  <TableHead className="text-center w-32">מחיר יחידה</TableHead>
                  <TableHead className="text-center w-32">כמות נמכרת</TableHead>
                  <TableHead className="text-center w-40">הכנסה</TableHead>
                  <TableHead className="w-24 text-center">פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const revenue = product.price * (product.quantity || 0)
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-center">₪{product.price.toLocaleString()}</TableCell>
                      <TableCell className="text-center">{(product.quantity || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-center font-bold text-green-600">
                        ₪{revenue.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEdit(product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {/* Total Row */}
                <TableRow className="bg-primary/5 font-bold">
                  <TableCell colSpan={3} className="text-left">סה״כ הכנסות</TableCell>
                  <TableCell className="text-center text-xl text-green-600">
                    ₪{totalRevenue.toLocaleString()}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}

        {/* Add/Edit Form */}
        {isAdding ? (
          <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
            <h4 className="font-medium">
              {editingId ? 'עריכת מוצר/שירות' : 'הוספת מוצר/שירות חדש'}
            </h4>
            
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="שם המוצר/שירות"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="לדוגמה: ייעוץ עסקי"
              />
              
              <Input
                label="מחיר יחידה (₪)"
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
              />

              <Input
                label="כמות נמכרת (חודשי)"
                type="number"
                min={0}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
              />
            </div>

            {price && quantity && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <span className="text-sm text-green-700">הכנסה חודשית צפויה: </span>
                <span className="text-lg font-bold text-green-600">
                  ₪{(Number(price) * Number(quantity)).toLocaleString()}
                </span>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleSave}>
                {editingId ? 'עדכן' : 'הוסף'}
              </Button>
              <Button variant="secondary" onClick={resetForm}>
                ביטול
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setIsAdding(true)} className="w-full">
            <Plus className="h-4 w-4 ml-2" />
            הוסף מוצר/שירות
          </Button>
        )}

        {products.length === 0 && !isAdding && (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>עדיין לא הוספת מוצרים או שירותים</p>
            <p className="text-sm">לחץ על הכפתור למעלה להוספת המוצר הראשון</p>
          </div>
        )}

        {/* Summary */}
        {products.length > 0 && (
          <div className="bg-primary/5 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">סה״כ הכנסות חודשיות:</span>
                <p className="text-sm text-gray-500">{products.length} מוצרים/שירותים</p>
              </div>
              <span className="text-3xl font-bold text-green-600">
                ₪{totalRevenue.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="secondary" onClick={() => router.push('/wizard/step-1')}>
            <ArrowRight className="h-4 w-4 ml-2" />
            חזרה
          </Button>
          <Button 
            onClick={() => router.push('/wizard/step-3')}
            disabled={products.length === 0}
          >
            המשך
            <ArrowLeft className="h-4 w-4 mr-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
