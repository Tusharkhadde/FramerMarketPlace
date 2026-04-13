import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  MoreVertical,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Package,
  Filter,
  Download,
  Star,
  AlertCircle,
  MapPin,
  Ban,
  Clock,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { formatPrice, formatDate, cn, getProductImageUrl } from '@/lib/utils'
import { toast } from 'sonner'
import api from '@/config/api'

const dummyProducts = [
  {
    _id: '1', cropName: 'Fresh Tomatoes', category: 'vegetables', pricePerKg: 40,
    quantityAvailable: 500, qualityGrade: 'A', district: 'Nashik', isOrganic: true,
    isAvailable: true, isApproved: true, views: 234, isFeatured: false,
    farmer: { fullName: 'Ramesh Patil', _id: 'f1' },
    images: [{ url: '/images/tomato.jpg' }],
    ratings: { average: 4.5, count: 12 },
    createdAt: '2024-12-01',
  },
  {
    _id: '2', cropName: 'Alphonso Mangoes', category: 'fruits', pricePerKg: 350,
    quantityAvailable: 200, qualityGrade: 'A', district: 'Ratnagiri', isOrganic: false,
    isAvailable: true, isApproved: true, views: 567, isFeatured: true,
    farmer: { fullName: 'Suresh More', _id: 'f2' },
    images: [{ url: '/images/mango.jpg' }],
    ratings: { average: 4.8, count: 25 },
    createdAt: '2024-11-15',
  },
  {
    _id: '3', cropName: 'Red Onions', category: 'vegetables', pricePerKg: 25,
    quantityAvailable: 1000, qualityGrade: 'B', district: 'Nashik', isOrganic: false,
    isAvailable: true, isApproved: false, views: 89, isFeatured: false,
    farmer: { fullName: 'Ganesh Jadhav', _id: 'f3' },
    images: [{ url: '/images/onion.jpg' }],
    ratings: { average: 0, count: 0 },
    createdAt: '2024-12-10',
  },
  {
    _id: '4', cropName: 'Organic Turmeric', category: 'spices', pricePerKg: 180,
    quantityAvailable: 50, qualityGrade: 'A', district: 'Sangli', isOrganic: true,
    isAvailable: false, isApproved: true, views: 145, isFeatured: false,
    farmer: { fullName: 'Vijay Shinde', _id: 'f4' },
    images: [{ url: '/images/turmeric.jpg' }],
    ratings: { average: 4.2, count: 8 },
    createdAt: '2024-10-20',
  },
]

const AdminProducts = () => {
  const [products, setProducts] = useState(dummyProducts)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, product: null })

  const stats = {
    total: products.length,
    approved: products.filter(p => p.isApproved).length,
    pending: products.filter(p => !p.isApproved).length,
    featured: products.filter(p => p.isFeatured).length,
    outOfStock: products.filter(p => p.quantityAvailable === 0 || !p.isAvailable).length,
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.farmer.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'approved' && p.isApproved) ||
      (statusFilter === 'pending' && !p.isApproved) ||
      (statusFilter === 'featured' && p.isFeatured)
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleApprove = (productId) => {
    setProducts(prev => prev.map(p => p._id === productId ? { ...p, isApproved: true } : p))
    toast.success('Product approved')
    setConfirmDialog({ open: false, action: null, product: null })
  }

  const handleReject = (productId) => {
    setProducts(prev => prev.map(p => p._id === productId ? { ...p, isApproved: false, isAvailable: false } : p))
    toast.success('Product rejected')
    setConfirmDialog({ open: false, action: null, product: null })
  }

  const handleToggleFeatured = (productId) => {
    setProducts(prev => prev.map(p => p._id === productId ? { ...p, isFeatured: !p.isFeatured } : p))
    toast.success('Featured status updated')
  }

  const handleDelete = (productId) => {
    setProducts(prev => prev.filter(p => p._id !== productId))
    toast.success('Product deleted')
    setConfirmDialog({ open: false, action: null, product: null })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Product Management</h1>
          <p className="text-muted-foreground mt-1">Review and manage all products</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Products', value: stats.total, icon: Package, color: 'text-blue-400', border: 'border-blue-500/20', glow: 'shadow-blue-500/10' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'text-emerald-400', border: 'border-emerald-500/20', glow: 'shadow-emerald-500/10' },
          { label: 'Pending Approval', value: stats.pending, icon: Clock, color: 'text-amber-400', border: 'border-amber-500/20', glow: 'shadow-amber-500/10' },
          { label: 'Featured', value: stats.featured, icon: Star, color: 'text-purple-400', border: 'border-purple-500/20', glow: 'shadow-purple-500/10' },
          { label: 'Out of Stock', value: stats.outOfStock, icon: AlertCircle, color: 'text-rose-400', border: 'border-rose-500/20', glow: 'shadow-rose-500/10' },
        ].map(stat => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -4 }}
            className="group"
          >
            <Card className={cn("glass-premium border-t-2 relative overflow-hidden transition-all duration-300", stat.border, stat.glow)}>
              <CardContent className="p-4 relative z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mb-1">{stat.label}</p>
                    <p className={cn('text-3xl font-black tracking-tight', stat.color)}>{stat.value}</p>
                  </div>
                  <div className={cn("p-2.5 rounded-xl transition-colors duration-300", stat.color.replace('text', 'bg') + '/10')}>
                    <stat.icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", stat.color)} />
                  </div>
                </div>
              </CardContent>
              {/* Subtle glow effect */}
              <div className={cn("absolute -bottom-6 -right-6 w-24 h-24 blur-3xl opacity-10 group-hover:opacity-30 transition-opacity duration-500", stat.color.replace('text', 'bg'))} />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products or farmers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="vegetables">Vegetables</SelectItem>
                <SelectItem value="fruits">Fruits</SelectItem>
                <SelectItem value="grains">Grains</SelectItem>
                <SelectItem value="pulses">Pulses</SelectItem>
                <SelectItem value="spices">Spices</SelectItem>
                <SelectItem value="dairy">Dairy</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Farmer</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map(product => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={getProductImageUrl(product.images?.[0]?.url)}
                          alt={product.cropName}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-foreground flex items-center gap-1">
                            {product.cropName}
                            {product.isFeatured && (
                              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            )}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {product.district}
                            {product.isOrganic && (
                              <Badge className="ml-1 bg-green-100 text-green-700 text-[10px] px-1">
                                Organic
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize text-sm">{product.category}</TableCell>
                    <TableCell className="text-sm">{product.farmer.fullName}</TableCell>
                    <TableCell className="font-medium">{formatPrice(product.pricePerKg)}/kg</TableCell>
                    <TableCell>
                      <span className={cn(
                        'text-sm font-medium',
                        product.quantityAvailable === 0 ? 'text-red-600' :
                        product.quantityAvailable < 50 ? 'text-orange-600' : 'text-green-600'
                      )}>
                        {product.quantityAvailable} kg
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        product.qualityGrade === 'A' ? 'bg-farmer-500' :
                        product.qualityGrade === 'B' ? 'bg-yellow-500' : 'bg-gray-500'
                      )}>
                        Grade {product.qualityGrade}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {product.isApproved ? (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approved
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-700">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{product.views}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedProduct(product)
                            setDetailsDialogOpen(true)
                          }}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {!product.isApproved && (
                            <DropdownMenuItem
                              className="text-green-600"
                              onClick={() => setConfirmDialog({ open: true, action: 'approve', product })}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleToggleFeatured(product._id)}>
                            <Star className="w-4 h-4 mr-2" />
                            {product.isFeatured ? 'Unfeature' : 'Feature'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-orange-600"
                            onClick={() => setConfirmDialog({ open: true, action: 'reject', product })}
                          >
                            <Ban className="w-4 h-4 mr-2" />
                            Reject
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setConfirmDialog({ open: true, action: 'delete', product })}
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
          {filteredProducts.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No products found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-lg">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProduct.cropName}</DialogTitle>
                <DialogDescription>Product Details</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <img
                  src={getProductImageUrl(selectedProduct.images?.[0]?.url)}
                  alt={selectedProduct.cropName}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Category</p>
                    <p className="font-medium capitalize">{selectedProduct.category}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Price</p>
                    <p className="font-medium">{formatPrice(selectedProduct.pricePerKg)}/kg</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Quality</p>
                    <p className="font-medium">Grade {selectedProduct.qualityGrade}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Stock</p>
                    <p className="font-medium">{selectedProduct.quantityAvailable} kg</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">District</p>
                    <p className="font-medium">{selectedProduct.district}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Farmer</p>
                    <p className="font-medium">{selectedProduct.farmer.fullName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Listed On</p>
                    <p className="font-medium">{formatDate(selectedProduct.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rating</p>
                    <p className="font-medium flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      {selectedProduct.ratings.average || 'N/A'} ({selectedProduct.ratings.count})
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                {!selectedProduct.isApproved && (
                  <Button variant="farmer" onClick={() => { handleApprove(selectedProduct._id); setDetailsDialogOpen(false) }}>
                    Approve Product
                  </Button>
                )}
                <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.action === 'approve' && 'Approve Product'}
              {confirmDialog.action === 'reject' && 'Reject Product'}
              {confirmDialog.action === 'delete' && 'Delete Product'}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.action === 'approve' && `Approve "${confirmDialog.product?.cropName}"?`}
              {confirmDialog.action === 'reject' && `Reject "${confirmDialog.product?.cropName}"? It will be hidden.`}
              {confirmDialog.action === 'delete' && `Permanently delete "${confirmDialog.product?.cropName}"?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog({ open: false, action: null, product: null })}>
              Cancel
            </Button>
            <Button
              variant={confirmDialog.action === 'approve' ? 'farmer' : 'destructive'}
              onClick={() => {
                if (confirmDialog.action === 'approve') handleApprove(confirmDialog.product._id)
                if (confirmDialog.action === 'reject') handleReject(confirmDialog.product._id)
                if (confirmDialog.action === 'delete') handleDelete(confirmDialog.product._id)
              }}
            >
              {confirmDialog.action === 'approve' && 'Approve'}
              {confirmDialog.action === 'reject' && 'Reject'}
              {confirmDialog.action === 'delete' && 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminProducts