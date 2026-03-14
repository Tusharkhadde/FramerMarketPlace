import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import api from '@/config/api'
import { formatPrice } from '@/lib/utils'
import Loading from '@/components/shared/Loading'
import { toast } from 'sonner'

const FarmerProducts = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [columnVisibility, setColumnVisibility] = useState({})

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
    const matchesCategory = !filterCategory || product.category === filterCategory
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && product.isAvailable) ||
      (filterStatus === 'inactive' && !product.isAvailable)

    return matchesCategory && matchesStatus
  })

  const stats = {
    total: products.length,
    active: products.filter(p => p.isAvailable).length,
    inactive: products.filter(p => !p.isAvailable).length,
    lowStock: products.filter(p => p.quantityAvailable < 10).length,
  }

  const columns = [
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <img
            src={product.images?.[0]?.url || '/placeholder.jpg'}
            alt={product.cropName}
            className="w-12 h-12 rounded object-cover"
          />
        );
      }
    },
    { accessorKey: "cropName", header: "Name" },
    { accessorKey: "category", header: "Category", cell: ({ row }) => <span className="capitalize">{row.getValue("category")}</span> },
    {
      accessorKey: "pricePerKg",
      header: "Price/kg",
      cell: ({ row }) => {
        const price = row.getValue("pricePerKg");
        return <span className="font-medium text-farmer-600 dark:text-farmer-400">{formatPrice(price)}</span>;
      },
    },
    {
      accessorKey: "quantityAvailable",
      header: "Stock",
      cell: ({ row }) => {
        const stock = row.getValue("quantityAvailable");
        const unit = row.original.unit || 'kg';
        return (
          <div className="flex items-center gap-2">
            <span className={stock < 10 ? "text-red-500 font-semibold" : ""}>{stock} {unit}</span>
            {stock < 10 && <AlertCircle className="w-4 h-4 text-red-500" />}
          </div>
        )
      }
    },
    {
       accessorKey: "qualityGrade",
       header: "Grade",
       cell: ({ row }) => {
         const grade = row.getValue("qualityGrade");
         return (
             <span className={`text-xs px-2 py-1 rounded-full ${grade === 'A' ? 'bg-farmer-100 text-farmer-700 dark:bg-farmer-900/30 dark:text-farmer-400' :
                grade === 'B' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
              }`}>
              {grade}
            </span>
         )
       }
    },
    {
      accessorKey: "isAvailable",
      header: "Status",
      cell: ({ row }) => {
        const isAvailable = row.getValue("isAvailable");
        return (
          <span className={`text-xs px-2 py-1 rounded-full ${isAvailable ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
            {isAvailable ? 'Active' : 'Inactive'}
          </span>
        )
      }
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/farmer/products/edit/${product._id}`)}>
                <Edit className="w-4 h-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToggleAvailability(product._id, product.isAvailable)}>
                {product.isAvailable ? (
                  <><EyeOff className="w-4 h-4 mr-2" /> Deactivate</>
                ) : (
                  <><Eye className="w-4 h-4 mr-2" /> Activate</>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteProduct(product._id)} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }
  ];

  const table = useReactTable({
    data: filteredProducts,
    columns,
    state: {
      globalFilter,
      columnVisibility,
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (loading) return <Loading />

  return (
    <div className="space-y-6 max-w-[100vw] overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Products</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your product listings
          </p>
        </div>
        <Button onClick={() => navigate('/farmer/products/add')} className="w-full sm:w-auto hover:scale-105 transition-transform">
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

      {/* Product Table Container */}
      <Card className="border-0 shadow-md ring-1 ring-gray-200 dark:ring-neutral-800 overflow-hidden">
        <CardContent className="p-0">
          <div className="w-full bg-white dark:bg-neutral-900 px-4 py-6 sm:px-6">
            <div className="w-full space-y-6">
              {/* Header & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1 flex flex-col md:flex-row gap-4">
                  <div className="relative max-w-sm w-full">
                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                     <Input
                        placeholder="Search products..."
                        value={globalFilter ?? ""}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="pl-10 border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white focus-visible:ring-farmer-500 w-full"
                      />
                  </div>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white rounded-md px-4 py-2 w-full md:w-48 text-sm focus:ring-2 focus:ring-farmer-500 outline-none transition-shadow"
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
                    className="border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white rounded-md px-4 py-2 w-full md:w-48 text-sm focus:ring-2 focus:ring-farmer-500 outline-none transition-shadow"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                
                <div className="hidden sm:flex gap-2">
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
                    className="border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 bg-white dark:bg-neutral-900 shadow-sm transition-all active:scale-95"
                  >
                    {table.getAllLeafColumns().some((col) => !col.getIsVisible())
                      ? "Expand Columns"
                      : "Collapse Columns"}
                  </Button>
                </div>
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
                                    <p className="text-sm mt-1 mb-4">You don't have any products matching these filters.</p>
                                    {products.length === 0 && (
                                        <Button onClick={() => navigate('/farmer/products/add')} variant="outline" className="shadow-sm">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Your First Product
                                        </Button>
                                    )}
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
    </div>
  )
}

// Stat Card Component
const StatCard = ({ label, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    gray: 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  }

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow ring-1 ring-black/5 dark:ring-white/10 dark:bg-neutral-900 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10 blur-[1px]">
                <Icon className={`w-24 h-24 ${colorClasses[color].split(' ')[1]}`} />
            </div>
            <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${colorClasses[color]} flex items-center justify-center shadow-sm`}>
                    <Icon className="w-6 h-6" strokeWidth={2.5} />
                </div>
                </div>
            </CardContent>
        </Card>
    </motion.div>
  )
}

export default FarmerProducts