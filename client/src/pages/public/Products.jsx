import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  SlidersHorizontal,
  Grid3x3,
  List,
  ChevronDown,
  MapPin,
  Star,
  Leaf,
  Filter,
  X,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import api from '@/config/api'
import { formatPrice, getProductImageUrl } from '@/lib/utils'
import Loading from '@/components/shared/Loading'
import { toast } from 'sonner'

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  // State
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false)
  const [totalProducts, setTotalProducts] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  // Filter States
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    district: searchParams.get('district') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    qualityGrade: searchParams.get('qualityGrade') || '',
    isOrganic: searchParams.get('isOrganic') === 'true',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
  })

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'grains', label: 'Grains' },
    { value: 'pulses', label: 'Pulses' },
    { value: 'spices', label: 'Spices' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'other', label: 'Other' },
  ]

  const districts = [
    'Mumbai', 'Pune', 'Nashik', 'Nagpur', 'Aurangabad', 'Solapur',
    'Kolhapur', 'Satara', 'Sangli', 'Ahmednagar', 'Ratnagiri',
    'Thane', 'Jalgaon', 'Amravati', 'Nanded', 'Beed', 'Latur',
  ]

  const sortOptions = [
    { value: 'createdAt-desc', label: 'Newest First' },
    { value: 'createdAt-asc', label: 'Oldest First' },
    { value: 'pricePerKg-asc', label: 'Price: Low to High' },
    { value: 'pricePerKg-desc', label: 'Price: High to Low' },
    { value: 'ratings.average-desc', label: 'Highest Rated' },
    { value: 'cropName-asc', label: 'Name: A to Z' },
  ]

  // Fetch products
  useEffect(() => {
    fetchProducts()
  }, [filters, currentPage])

  const fetchProducts = async () => {
    try {
      setLoading(true)

      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 12,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '' && value !== false)
        ),
      })

      const response = await api.get(`/products?${queryParams}`)
      setProducts(response.data.data.products || [])
      setTotalProducts(response.data.data.total || 0)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value.toString())
    })
    setSearchParams(params)
  }, [filters])

   const handleFilterChange = (key, value) => {
    const finalValue = value === 'all' ? '' : value
    setFilters(prev => ({ ...prev, [key]: finalValue }))
    setCurrentPage(1)
  }

  const handleSortChange = (value) => {
    const [sortBy, sortOrder] = value.split('-')
    setFilters(prev => ({ ...prev, sortBy, sortOrder }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      district: '',
      minPrice: '',
      maxPrice: '',
      qualityGrade: '',
      isOrganic: false,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })
    setCurrentPage(1)
  }

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== 'createdAt' && v !== 'desc').length

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Fresh Farm Products
          </h1>
          <p className="text-muted-foreground">
            {totalProducts} products available from verified farmers
          </p>
        </div>

        {/* Search and Actions Bar */}
        <div className="bg-card rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
               <Input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 bg-card border-zinc-200"
              />
            </div>

            {/* Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Sort By
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {sortOptions.map(option => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filter Toggle (Mobile) */}
            <Button
              variant="outline"
              className="md:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-2 bg-farmer-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>

            {/* View Toggle */}
            <div className="hidden md:flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {filters.category && (
                <FilterTag
                  label={`Category: ${filters.category}`}
                  onRemove={() => handleFilterChange('category', '')}
                />
              )}
              {filters.district && (
                <FilterTag
                  label={`District: ${filters.district}`}
                  onRemove={() => handleFilterChange('district', '')}
                />
              )}
              {filters.qualityGrade && (
                <FilterTag
                  label={`Grade: ${filters.qualityGrade}`}
                  onRemove={() => handleFilterChange('qualityGrade', '')}
                />
              )}
              {filters.isOrganic && (
                <FilterTag
                  label="Organic"
                  onRemove={() => handleFilterChange('isOrganic', false)}
                />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700"
              >
                Clear All
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {(showFilters || window.innerWidth >= 768) && (
              <motion.aside
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                className="w-full md:w-64 flex-shrink-0"
              >
                <Card className="sticky top-4">
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">Filters</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="md:hidden"
                        onClick={() => setShowFilters(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                     {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Category
                      </label>
                      <Select
                        value={filters.category}
                        onValueChange={(value) => handleFilterChange('category', value)}
                      >
                        <SelectTrigger className="w-full bg-card border-zinc-200">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat.value || 'all'} value={cat.value || 'all'}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                     {/* District Filter */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        District
                      </label>
                      <Select
                        value={filters.district}
                        onValueChange={(value) => handleFilterChange('district', value === 'all' ? '' : value)}
                      >
                        <SelectTrigger className="w-full bg-card border-zinc-200">
                          <SelectValue placeholder="All Districts" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Districts</SelectItem>
                          {districts.map(dist => (
                            <SelectItem key={dist} value={dist}>{dist}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Price Range (₹/kg)
                      </label>
                      <div className="flex gap-2">
                         <Input
                          type="number"
                          placeholder="Min"
                          value={filters.minPrice}
                          onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                          className="bg-card border-zinc-200"
                        />
                        <Input
                          type="number"
                          placeholder="Max"
                          value={filters.maxPrice}
                          onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                          className="bg-card border-zinc-200"
                        />
                      </div>
                    </div>

                    {/* Quality Grade */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Quality Grade
                      </label>
                      <div className="space-y-2">
                        {['A', 'B', 'C'].map(grade => (
                          <label key={grade} className="flex items-center">
                            <input
                              type="radio"
                              name="grade"
                              value={grade}
                              checked={filters.qualityGrade === grade}
                              onChange={(e) => handleFilterChange('qualityGrade', e.target.value)}
                              className="mr-2"
                            />
                            Grade {grade}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Organic */}
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.isOrganic}
                          onChange={(e) => handleFilterChange('isOrganic', e.target.checked)}
                          className="mr-2"
                        />
                        <Leaf className="w-4 h-4 mr-1 text-green-600" />
                        Organic Only
                      </label>
                    </div>
                  </CardContent>
                </Card>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <div className="flex-1">
              {loading ? (
              <Loading />
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No products found</p>
                <Button onClick={clearFilters} className="mt-4">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className={`grid ${viewMode === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'grid-cols-1 gap-4'
                  }`}>
                  {products.map(product => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalProducts > 12 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={Math.ceil(totalProducts / 12)}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Filter Tag Component
const FilterTag = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 bg-farmer-100 text-farmer-700 px-3 py-1 rounded-full text-sm">
    {label}
    <button onClick={onRemove} className="hover:bg-farmer-200 rounded-full p-0.5">
      <X className="w-3 h-3" />
    </button>
  </span>
)

// Product Card Component
const ProductCard = ({ product, viewMode }) => {
  const navigate = useNavigate()

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/products/${product._id}`)}>
        <CardContent className="p-4 flex gap-4">
          <img
            src={getProductImageUrl(product.images?.[0]?.url)}
            alt={product.cropName}
            className="w-24 h-24 object-cover rounded-lg"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg text-foreground">{product.cropName}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  {product.district}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-farmer-600">
                  {formatPrice(product.pricePerKg)}
                  <span className="text-sm font-normal text-muted-foreground">/kg</span>
                </div>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              {product.isOrganic && (
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                  Organic
                </span>
              )}
              <span className="bg-farmer-100 text-farmer-700 text-xs px-2 py-1 rounded">
                Grade {product.qualityGrade}
              </span>
              {product.ratings.average > 0 && (
                <span className="flex items-center text-sm">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                  {product.ratings.average.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
      onClick={() => navigate(`/products/${product._id}`)}>
      <div className="relative overflow-hidden">
        <img
          src={getProductImageUrl(product.images?.[0]?.url)}
          alt={product.cropName}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {product.isOrganic && (
          <span className="absolute top-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            Organic
          </span>
        )}
        <span className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full ${product.qualityGrade === 'A' ? 'bg-farmer-500 text-white' :
            product.qualityGrade === 'B' ? 'bg-yellow-500 text-white' :
              'bg-gray-500 text-white'
          }`}>
          Grade {product.qualityGrade}
        </span>
      </div>
      <CardContent className="p-4">
                <div className="text-sm text-muted-foreground mb-1 flex items-center">
          <MapPin className="w-3 h-3 mr-1 text-muted-foreground" />
          {product.district}
        </div>
        <h3 className="font-semibold text-foreground mb-2 truncate">
          {product.cropName}
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-farmer-600">
              {formatPrice(product.pricePerKg)}
            </span>
            <span className="text-sm text-muted-foreground">/kg</span>
          </div>
          {product.ratings.average > 0 && (
            <div className="flex items-center">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="ml-1 text-sm">{product.ratings.average.toFixed(1)}</span>
            </div>
          )}
        </div>
        <div className="mt-3 text-sm text-muted-foreground">
          by {product.farmer?.fullName || 'Local Farmer'}
        </div>
      </CardContent>
    </Card>
  )
}

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </Button>
      {pages.map(page => (
        <Button
          key={page}
          variant={currentPage === page ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </Button>
    </div>
  )
}

export default Products