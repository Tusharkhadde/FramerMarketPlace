import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Package,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
//import productService from '@/services/product.service'
import { formatPrice, formatDate, cn } from '@/lib/utils'
import { toast } from 'sonner'

const FarmerProducts = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
  })

  useEffect(() => {
    fetchProducts()
  }, [statusFilter])

  const fetchProducts = async (page = 1) => {
    setLoading(true)
    try {
      const params = {
        page,
        limit: 10,
        ...(statusFilter !== 'all' && { status: statusFilter }),
      }
      const response = await productService.getMyProducts(params)
      setProducts(response.data.products)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAvailability = async (productId) => {
    try {
      await productService.toggleAvailability(productId)
      toast.success('Product availability updated')
      fetchProducts(pagination.currentPage)
    } catch (error) {
      toast.error('Failed to update product')
    }
  }

  const handleDeleteProduct = async () => {
    if (!productToDelete) return

    try {
      await productService.deleteProduct(productToDelete._id)
      toast.success('Product deleted successfully')
      setDeleteDialogOpen(false)
      setProductToDelete(null)
      fetchProducts(pagination.currentPage)
    } catch (error) {
      toast.error('Failed to delete product')
    }
  }

  const filteredProducts = products.filter((product) =>
    product.cropName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: products.length,
    available: products.filter((p) => p.isAvailable && p.quantityAvailable > 0).length,
    outOfStock: products.filter((p) => p.quantityAvailable === 0).length,
    disabled: products.filter((p) => !p.isAvailable).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          <p className="text-gray-500 mt-1">
            Manage your product listings
          </p>
        </div>
        <Button variant="farmer" onClick={() => navigate('/farmer/products/add')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: stats.total, color: 'text-blue-600' },
          { label: 'Available', value: stats.available, color: 'text-green-600' },
          { label: 'Out of Stock', value: stats.outOfStock, color: 'text-orange-600' },
          { label: 'Disabled', value: stats.disabled, color: 'text-red-600' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className={cn('text-2xl font-bold', stat.color)}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-farmer-500 border-t-transparent rounded-full mx-auto" />
              <p className="text-gray-500 mt-4">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm
                  ? 'Try a different search term'
                  : 'Start by adding your first product'}
              </p>
              {!searchTerm && (
                <Button
                  variant="farmer"
                  onClick={() => navigate('/farmer/products/add')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <img
                            src={product.images?.[0]?.url || '/images/placeholder-product.jpg'}
                            alt={product.cropName}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              {product.cropName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {product.views} views
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{product.category}</TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(product.pricePerKg)}/kg
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'font-medium',
                            product.quantityAvailable === 0
                              ? 'text-red-600'
                              : product.quantityAvailable < 10
                              ? 'text-orange-600'
                              : 'text-green-600'
                          )}
                        >
                          {product.quantityAvailable} kg
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            product.qualityGrade === 'A'
                              ? 'bg-farmer-500'
                              : product.qualityGrade === 'B'
                              ? 'bg-yellow-500'
                              : 'bg-gray-500'
                          )}
                        >
                          Grade {product.qualityGrade}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {product.isAvailable && product.quantityAvailable > 0 ? (
                          <Badge className="bg-green-100 text-green-700">
                            Available
                          </Badge>
                        ) : product.quantityAvailable === 0 ? (
                          <Badge className="bg-red-100 text-red-700">
                            Out of Stock
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-700">
                            Disabled
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {formatDate(product.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => navigate(`/farmer/products/edit/${product._id}`)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => window.open(`/products/${product._id}`, '_blank')}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Public
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleAvailability(product._id)}
                            >
                              {product.isAvailable ? (
                                <>
                                  <EyeOff className="w-4 h-4 mr-2" />
                                  Disable
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Enable
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setProductToDelete(product)
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            disabled={pagination.currentPage === 1}
            onClick={() => fetchProducts(pagination.currentPage - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={pagination.currentPage === pagination.totalPages}
            onClick={() => fetchProducts(pagination.currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{productToDelete?.cropName}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default FarmerProducts