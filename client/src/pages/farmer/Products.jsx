import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MoreVertical,
  Package,
  TrendingUp,
  AlertCircle,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import api from '@/config/api'
import { formatPrice } from '@/lib/utils'
import Loading from '@/components/shared/Loading'
import { toast } from 'sonner'

const FarmerProducts = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'grains', label: 'Grains' },
    { value: 'pulses', label: 'Pulses' },
    { value: 'spices', label: 'Spices' },
    { value: 'dairy', label: 'Dairy' },
  ]

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/products/my/products')
      setProducts(response.data.data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAvailability = async (productId, currentStatus) => {
    try {
      await api.patch(`/products/${productId}/toggle-availability`)
      setProducts(products.map(p =>
        p._id === productId ? { ...p, isAvailable: !currentStatus } : p
      ))
      toast.success(`Product ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
    } catch (error) {
      toast.error('Failed to update product status')
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return

    try {
      await api.delete(`/products/${productId}`)
      setProducts(products.filter(p => p._id !== productId))
      toast.success('Product deleted successfully')
    } catch (error) {
      toast.error('Failed to delete product')
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.cropName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || product.category === filterCategory
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && product.isAvailable) ||
      (filterStatus === 'inactive' && !product.isAvailable)

    return matchesSearch && matchesCategory && matchesStatus
  })

  const stats = {
    total: products.length,
    active: products.filter(p => p.isAvailable).length,
    inactive: products.filter(p => !p.isAvailable).length,
    lowStock: products.filter(p => p.quantityAvailable < 10).length,
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your product listings
          </p>
        </div>
        <Button onClick={() => navigate('/farmer/products/add')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Products"
          value={stats.total}
          icon={Package}
          color="blue"
        />
        <StatCard
          label="Active"
          value={stats.active}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          label="Inactive"
          value={stats.inactive}
          icon={EyeOff}
          color="gray"
        />
        <StatCard
          label="Low Stock"
          value={stats.lowStock}
          icon={AlertCircle}
          color="red"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border rounded-md px-4 py-2 w-full md:w-48"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded-md px-4 py-2 w-full md:w-48"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No products found
            </h3>
            <p className="text-muted-foreground mb-4">
              {products.length === 0
                ? "You haven't added any products yet"
                : 'Try adjusting your filters'}
            </p>
            {products.length === 0 && (
              <Button onClick={() => navigate('/farmer/products/add')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Product
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onToggleAvailability={handleToggleAvailability}
              onDelete={handleDeleteProduct}
              onEdit={(id) => navigate(`/farmer/products/edit/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Stat Card Component
const StatCard = ({ label, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    gray: 'bg-muted/10 text-muted-foreground',
    red: 'bg-red-100 text-red-600',
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
          </div>
          <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Product Card Component
const ProductCard = ({ product, onToggleAvailability, onDelete, onEdit }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative">
          <img
            src={product.images?.[0]?.url || '/placeholder.jpg'}
            alt={product.cropName}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            {product.isOrganic && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Organic
              </span>
            )}
            <span className={`text-xs px-2 py-1 rounded-full ${product.qualityGrade === 'A' ? 'bg-farmer-500 text-white' :
                product.qualityGrade === 'B' ? 'bg-yellow-500 text-white' :
                  'bg-gray-500 text-white'
              }`}>
              Grade {product.qualityGrade}
            </span>
          </div>
          <div className="absolute top-2 left-2 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
            <Switch
              checked={product.isAvailable}
              onCheckedChange={() => onToggleAvailability(product._id, product.isAvailable)}
              className="scale-75"
            />
            <span className="text-[10px] font-medium text-white uppercase tracking-wider">
              {product.isAvailable ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-foreground truncate">
                {product.cropName}
              </h3>
              <p className="text-sm text-muted-foreground capitalize">{product.category}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(product._id)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onToggleAvailability(product._id, product.isAvailable)}
                >
                  {product.isAvailable ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(product._id)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Price:</span>
              <span className="font-semibold text-farmer-600">
                {formatPrice(product.pricePerKg)}/kg
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Stock:</span>
              <span className={`font-semibold ${product.quantityAvailable < 10 ? 'text-red-600' : 'text-foreground'
                }`}>
                {product.quantityAvailable} {product.unit}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Views:</span>
              <span className="text-sm text-foreground">{product.views || 0}</span>
            </div>
          </div>

          {product.quantityAvailable < 10 && (
            <div className="mt-3 flex items-center text-xs text-red-600">
              <AlertCircle className="w-4 h-4 mr-1" />
              Low stock warning
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default FarmerProducts