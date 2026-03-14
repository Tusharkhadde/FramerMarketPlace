import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
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
import { formatPrice, formatDate, cn } from '@/lib/utils'
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
  const [columnVisibility, setColumnVisibility] = useState({})

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

  const columns = [
    {
      accessorKey: "product",
      header: "Product",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center gap-3">
            <img
              src={product.images?.[0]?.url || '/images/placeholder-product.jpg'}
              alt={product.cropName}
              className="w-10 h-10 rounded-lg object-cover shadow-sm"
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                {product.cropName}
                {product.isFeatured && (
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                )}
              </p>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <MapPin className="w-3 h-3" />
                {product.district}
                {product.isOrganic && (
                  <Badge className="ml-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] px-1 border-none">
                    Organic
                  </Badge>
                )}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => <span className="capitalize">{row.getValue("category")}</span>
    },
    {
      accessorKey: "farmer",
      header: "Farmer",
      cell: ({ row }) => <span>{row.original.farmer?.fullName}</span>
    },
    {
      accessorKey: "pricePerKg",
      header: "Price",
      cell: ({ row }) => <span className="font-medium">{formatPrice(row.getValue("pricePerKg"))}/kg</span>
    },
    {
       accessorKey: "quantityAvailable",
       header: "Stock",
       cell: ({ row }) => {
         const qty = row.getValue("quantityAvailable");
         return (
            <span className={cn(
              'text-sm font-medium',
               qty === 0 ? 'text-red-500 dark:text-red-400' :
               qty < 50 ? 'text-orange-500 dark:text-orange-400' : 'text-green-600 dark:text-green-400'
            )}>
              {qty} kg
            </span>
         )
       }
    },
    {
      accessorKey: "qualityGrade",
      header: "Grade",
      cell: ({ row }) => {
        const grade = row.getValue("qualityGrade");
        return (
          <Badge className={cn(
            grade === 'A' ? 'bg-farmer-500 dark:bg-farmer-600' :
            grade === 'B' ? 'bg-yellow-500 dark:bg-yellow-600' : 'bg-gray-500 dark:bg-gray-600', 'border-none text-white'
          )}>
            Grade {grade}
          </Badge>
        )
      }
    },
    {
       accessorKey: "isApproved",
       header: "Status",
       cell: ({ row }) => {
         const isApproved = row.getValue("isApproved");
         return isApproved ? (
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-none">
              <CheckCircle className="w-3 h-3 mr-1" />
              Approved
            </Badge>
          ) : (
            <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-none">
              <AlertCircle className="w-3 h-3 mr-1" />
              Pending
            </Badge>
          )
       }
    },
    { accessorKey: "views", header: "Views" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors active:scale-95">
                  <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 shadow-xl rounded-xl">
                <DropdownMenuItem onClick={() => {
                  setSelectedProduct(product)
                  setDetailsDialogOpen(true)
                }} className="hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors py-2 cursor-pointer">
                  <Eye className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                  View Details
                </DropdownMenuItem>
                {!product.isApproved && (
                  <DropdownMenuItem
                    className="text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors py-2 cursor-pointer"
                    onClick={() => setConfirmDialog({ open: true, action: 'approve', product })}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => handleToggleFeatured(product._id)} className="hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors py-2 cursor-pointer">
                  <Star className="w-4 h-4 mr-2 text-yellow-500" />
                  {product.isFeatured ? 'Unfeature' : 'Feature'}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-100 dark:bg-neutral-800 my-1" />
                <DropdownMenuItem
                  className="text-orange-600 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors py-2 cursor-pointer"
                  onClick={() => setConfirmDialog({ open: true, action: 'reject', product })}
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Reject
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors py-2 cursor-pointer"
                  onClick={() => setConfirmDialog({ open: true, action: 'delete', product })}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      }
    }
  ];

  const table = useReactTable({
    data: filteredProducts,
    columns,
    state: {
      globalFilter: searchTerm,
      columnVisibility,
    },
    onGlobalFilterChange: setSearchTerm,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-500 mt-1">Review and manage all products</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Approved', value: stats.approved, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Pending', value: stats.pending, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Featured', value: stats.featured, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Out of Stock', value: stats.outOfStock, color: 'text-red-600', bg: 'bg-red-50' },
        ].map(stat => (
          <Card key={stat.label} className={stat.bg}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">{stat.label}</p>
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
      <Card className="border-0 shadow-md ring-1 ring-gray-200 dark:ring-neutral-800 overflow-hidden">
        <CardContent className="p-0">
          <div className="w-full bg-white dark:bg-neutral-900 px-4 py-6 sm:px-6">
            <div className="w-full space-y-6">
              
              <div className="hidden sm:flex justify-end gap-2 mb-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const keys = table.getAllLeafColumns().map((col) => col.id);
                      setColumnVisibility((prev) =>
                        keys.reduce((acc, key) => {
                          acc[key] = !prev[key];
                          return acc;
                        }, {}));
                    }}
                    className="border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 bg-white dark:bg-neutral-900 shadow-sm transition-all active:scale-95 text-xs"
                  >
                    {table.getAllLeafColumns().some((col) => !col.getIsVisible())
                      ? "Expand Columns"
                      : "Collapse Columns"}
                  </Button>
              </div>

              {/* Table */}
              <div className="border border-gray-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-white dark:bg-neutral-950 shadow-sm">
                <div className="overflow-x-auto">
                    <Table className="w-full text-sm text-left">
                    <TableHeader className="bg-gray-50/80 dark:bg-neutral-900/50 backdrop-blur-sm border-b border-gray-200 dark:border-neutral-800">
                        {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
                            {headerGroup.headers.map((header) => (
                            <TableHead
                                key={header.id}
                                className="whitespace-nowrap px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 transition-colors"
                            >
                                {flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                            ))}
                        </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow 
                                key={row.id} 
                                className="border-b border-gray-100 dark:border-neutral-800/60 hover:bg-gray-50/80 dark:hover:bg-neutral-800/40 transition-colors data-[state=selected]:bg-gray-100 dark:data-[state=selected]:bg-neutral-800"
                            >
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id} className="px-4 py-3 align-middle text-gray-600 dark:text-gray-300">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                            ))}
                            </TableRow>
                        ))
                        ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-48 text-center text-gray-500 dark:text-gray-400">
                                <div className="flex flex-col items-center justify-center">
                                    <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100">No products found</p>
                                    <p className="text-sm mt-1 mb-4">No products match your current filters.</p>
                                </div>
                            </TableCell>
                        </TableRow>
                        )}
                    </TableBody>
                    </Table>
                </div>
              </div>

               {/* Pagination */}
               {table.getRowModel().rows.length > 0 && (
                  <div className="flex items-center justify-between pt-4 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-neutral-800">
                  <span>
                      Showing <span className="font-medium text-gray-900 dark:text-white">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span> to <span className="font-medium text-gray-900 dark:text-white">{Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)}</span> of{" "}
                      <span className="font-medium text-gray-900 dark:text-white">{table.getFilteredRowModel().rows.length}</span> entries
                  </span>
                  <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-white shadow-sm"
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-white shadow-sm"
                      >
                        Next
                      </Button>
                  </div>
                  </div>
              )}
            </div>
          </div>
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
                  src={selectedProduct.images?.[0]?.url || '/images/placeholder-product.jpg'}
                  alt={selectedProduct.cropName}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Category</p>
                    <p className="font-medium capitalize">{selectedProduct.category}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Price</p>
                    <p className="font-medium">{formatPrice(selectedProduct.pricePerKg)}/kg</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Quality</p>
                    <p className="font-medium">Grade {selectedProduct.qualityGrade}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Stock</p>
                    <p className="font-medium">{selectedProduct.quantityAvailable} kg</p>
                  </div>
                  <div>
                    <p className="text-gray-500">District</p>
                    <p className="font-medium">{selectedProduct.district}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Farmer</p>
                    <p className="font-medium">{selectedProduct.farmer.fullName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Listed On</p>
                    <p className="font-medium">{formatDate(selectedProduct.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Rating</p>
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