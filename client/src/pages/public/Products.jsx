import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  X,
  ChevronDown,
  Grid3X3,
  List,
  SlidersHorizontal,
  MapPin,
  Star,
  Leaf,
  ShoppingCart,
  Heart,
  Eye,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
//import productService from '@/services/product.service'
import { formatPrice, cn, debounce } from '@/lib/utils'
import { toast } from 'sonner'

// Maharashtra districts
const districts = [
  'All Districts',
  'Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara',
  'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli',
  'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban',
  'Nagpur', 'Nanded', 'Nandurbar', 'Nashik', 'Osmanabad', 'Palghar',
  'Parbhani', 'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara',
  'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal',
]

const categories = [
  { id: 'all', name: 'All Categories', icon: '🌾' },
  { id: 'vegetables', name: 'Vegetables', icon: '🥬' },
  { id: 'fruits', name: 'Fruits', icon: '🍎' },
  { id: 'grains', name: 'Grains', icon: '🌾' },
  { id: 'pulses', name: 'Pulses', icon: '🫘' },
  { id: 'spices', name: 'Spices', icon: '🌶️' },
  { id: 'dairy', name: 'Dairy', icon: '🥛' },
]

const sortOptions = [
  { value: 'createdAt-desc', label: 'Newest First' },
  { value: 'createdAt-asc', label: 'Oldest First' },
  { value: 'pricePerKg-asc', label: 'Price: Low to High' },
  { value: 'pricePerKg-desc', label: 'Price: High to Low' },
  { value: 'ratings.average-desc', label: 'Highest Rated' },
]

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { user, isAuthenticated } = useAuth()

  // State
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
  })
  const [viewMode, setViewMode] = useState('grid')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Filter state
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'all',
    district: searchParams.get('district') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    qualityGrade: searchParams.getAll('qualityGrade') || [],
    isOrganic: searchParams.get('isOrganic') === 'true',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
  })

  const [priceRange, setPriceRange] = useState([0, 1000])
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Fetch products
  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = {
        page,
        limit: 12,
        ...(filters.search && { search: filters.search }),
        ...(filters.category !== 'all' && { category: filters.category }),
        ...(filters.district && filters.district !== 'All Districts' && { district: filters.district }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.qualityGrade.length > 0 && { qualityGrade: filters.qualityGrade.join(',') }),
        ...(filters.isOrganic && { isOrganic: 'true' }),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      }

      const response = await productService.getProducts(params)
      setProducts(response.data.products)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.category !== 'all') params.set('category', filters.category)
    if (filters.district && filters.district !== 'All Districts') params.set('district', filters.district)
    if (filters.minPrice) params.set('minPrice', filters.minPrice)
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
    if (filters.isOrganic) params.set('isOrganic', 'true')
    
    setSearchParams(params, { replace: true })
  }, [filters, setSearchParams])

  // Debounced search
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (query.length >= 2) {
        try {
          const response = await productService.searchAutocomplete(query)
          setSearchSuggestions(response.data.suggestions)
          setShowSuggestions(true)
        } catch (error) {
          console.error('Search error:', error)
        }
      } else {
        setSearchSuggestions([])
        setShowSuggestions(false)
      }
    }, 300),
    []
  )

  const handleSearchChange = (e) => {
    const value = e.target.value
    setFilters(prev => ({ ...prev, search: value }))
    debouncedSearch(value)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setShowSuggestions(false)
    fetchProducts()
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleQualityGradeChange = (grade, checked) => {
    setFilters(prev => ({
      ...prev,
      qualityGrade: checked
        ? [...prev.qualityGrade, grade]
        : prev.qualityGrade.filter(g => g !== grade),
    }))
  }

  const handleSortChange = (value) => {
    const [sortBy, sortOrder] = value.split('-')
    setFilters(prev => ({ ...prev, sortBy, sortOrder }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      district: '',
      minPrice: '',
      maxPrice: '',
      qualityGrade: [],
      isOrganic: false,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })
    setPriceRange([0, 1000])
  }

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart')
      navigate('/login')
      return
    }
    if (user?.userType !== 'buyer') {
      toast.error('Only buyers can add items to cart')
      return
    }
    addItem(product, 1)
  }

  const activeFiltersCount = [
    filters.category !== 'all',
    filters.district && filters.district !== 'All Districts',
    filters.minPrice || filters.maxPrice,
    filters.qualityGrade.length > 0,
    filters.isOrganic,
  ].filter(Boolean).length

  // Filter Sidebar Component
  const FilterSidebar = ({ className }) => (
    <div className={cn('space-y-6', className)}>
      {/* Categories */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleFilterChange('category', category.id)}
              className={cn(
                'w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left',
                filters.category === category.id
                  ? 'bg-farmer-100 text-farmer-700'
                  : 'hover:bg-gray-100 text-gray-700'
              )}
            >
              <span className="text-xl">{category.icon}</span>
              <span className="text-sm font-medium">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* District */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">District</h3>
        <Select
          value={filters.district || 'All Districts'}
          onValueChange={(value) => handleFilterChange('district', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select district" />
          </SelectTrigger>
          <SelectContent>
            {districts.map((district) => (
              <SelectItem key={district} value={district}>
                {district}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
        <div className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={1000}
            step={10}
            className="w-full"
          />
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              className="w-full"
            />
            <span className="text-gray-400">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Quality Grade */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Quality Grade</h3>
        <div className="space-y-2">
          {['A', 'B', 'C'].map((grade) => (
            <div key={grade} className="flex items-center space-x-2">
              <Checkbox
                id={`grade-${grade}`}
                checked={filters.qualityGrade.includes(grade)}
                onCheckedChange={(checked) => handleQualityGradeChange(grade, checked)}
              />
              <Label htmlFor={`grade-${grade}`} className="text-sm cursor-pointer">
                Grade {grade}
                <span className="text-gray-500 ml-1">
                  {grade === 'A' && '(Premium)'}
                  {grade === 'B' && '(Standard)'}
                  {grade === 'C' && '(Economy)'}
                </span>
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Organic */}
      <div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="organic"
            checked={filters.isOrganic}
            onCheckedChange={(checked) => handleFilterChange('isOrganic', checked)}
          />
          <Label htmlFor="organic" className="text-sm cursor-pointer flex items-center">
            <Leaf className="w-4 h-4 mr-1 text-green-600" />
            Organic Only
          </Label>
        </div>
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button
          variant="outline"
          className="w-full"
          onClick={clearFilters}
        >
          <X className="w-4 h-4 mr-2" />
          Clear All Filters ({activeFiltersCount})
        </Button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Fresh Products</h1>
          <p className="text-gray-600 mt-2">
            Browse fresh produce from verified farmers across Maharashtra
          </p>
        </div>

        {/* Search and Sort Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={handleSearchChange}
                onFocus={() => filters.search.length >= 2 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="pl-10 pr-4"
              />
              
              {/* Search Suggestions */}
              <AnimatePresence>
                {showSuggestions && searchSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg mt-1 z-20"
                  >
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setFilters(prev => ({ ...prev, search: suggestion }))
                          setShowSuggestions(false)
                          fetchProducts()
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Sort */}
            <div className="flex items-center space-x-4">
              <Select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onValueChange={handleSortChange}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="hidden sm:flex items-center border rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 transition-colors',
                    viewMode === 'grid' ? 'bg-farmer-100 text-farmer-600' : 'text-gray-400'
                  )}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 transition-colors',
                    viewMode === 'list' ? 'bg-farmer-100 text-farmer-600' : 'text-gray-400'
                  )}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Filter Button */}
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge className="ml-2" variant="secondary">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterSidebar />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <FilterSidebar />
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {/* Results Count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                Showing {products.length} of {pagination.totalProducts} products
              </p>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              /* Empty State */
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search terms
                </p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            ) : (
              /* Product Grid */
              <motion.div
                layout
                className={cn(
                  'grid gap-6',
                  viewMode === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1'
                )}
              >
                <AnimatePresence>
                  {products.map((product, index) => (
                    <motion.div
                      key={product._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ProductCard
                        product={product}
                        viewMode={viewMode}
                        onAddToCart={() => handleAddToCart(product)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8 space-x-2">
                <Button
                  variant="outline"
                  disabled={pagination.currentPage === 1}
                  onClick={() => fetchProducts(pagination.currentPage - 1)}
                >
                  Previous
                </Button>
                
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <Button
                    key={i + 1}
                    variant={pagination.currentPage === i + 1 ? 'farmer' : 'outline'}
                    onClick={() => fetchProducts(i + 1)}
                    className="hidden sm:inline-flex"
                  >
                    {i + 1}
                  </Button>
                )).slice(
                  Math.max(0, pagination.currentPage - 3),
                  Math.min(pagination.totalPages, pagination.currentPage + 2)
                )}
                
                <Button
                  variant="outline"
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => fetchProducts(pagination.currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

// Product Card Component
const ProductCard = ({ product, viewMode, onAddToCart }) => {
  const navigate = useNavigate()

  if (viewMode === 'list') {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="flex">
          <div className="w-48 h-48 flex-shrink-0 relative">
            <img
              src={product.images?.[0]?.url || '/images/placeholder-product.jpg'}
              alt={product.cropName}
              className="w-full h-full object-cover"
            />
            {product.isOrganic && (
              <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Organic
              </span>
            )}
          </div>
          <CardContent className="flex-1 p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {product.cropName}
                </h3>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  {product.district}
                </div>
                <div className="flex items-center mt-2">
                  <Badge
                    variant={product.qualityGrade === 'A' ? 'default' : 'secondary'}
                    className={cn(
                      product.qualityGrade === 'A' && 'bg-farmer-500'
                    )}
                  >
                    Grade {product.qualityGrade}
                  </Badge>
                  {product.ratings?.average > 0 && (
                    <div className="flex items-center ml-2 text-sm">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="ml-1">{product.ratings.average}</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {product.description}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-farmer-600">
                  {formatPrice(product.pricePerKg)}
                </div>
                <div className="text-sm text-gray-500">per kg</div>
                <div className="mt-4 space-y-2">
                  <Button
                    variant="farmer"
                    size="sm"
                    className="w-full"
                    onClick={onAddToCart}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(`/products/${product._id}`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    )
  }

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative overflow-hidden">
        <img
          src={product.images?.[0]?.url || '/images/placeholder-product.jpg'}
          alt={product.cropName}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isOrganic && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
              <Leaf className="w-3 h-3 mr-1" />
              Organic
            </span>
          )}
          {product.isFresh && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              Fresh
            </span>
          )}
        </div>
        
        <span
          className={cn(
            'absolute top-3 right-3 text-xs px-2 py-1 rounded-full',
            product.qualityGrade === 'A'
              ? 'bg-farmer-500 text-white'
              : product.qualityGrade === 'B'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-500 text-white'
          )}
        >
          Grade {product.qualityGrade}
        </span>

        {/* Quick Actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full"
            onClick={() => navigate(`/products/${product._id}`)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full"
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="text-sm text-gray-500 mb-1 flex items-center">
          <MapPin className="w-3 h-3 mr-1" />
          {product.district}
        </div>
        
        <h3 className="font-semibold text-gray-900 mb-2 truncate">
          {product.cropName}
        </h3>
        
        {product.ratings?.average > 0 && (
          <div className="flex items-center mb-2">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm ml-1">{product.ratings.average}</span>
            <span className="text-xs text-gray-400 ml-1">
              ({product.ratings.count} reviews)
            </span>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-2xl font-bold text-farmer-600">
              {formatPrice(product.pricePerKg)}
            </span>
            <span className="text-sm text-gray-500">/kg</span>
          </div>
          <div className="text-xs text-gray-500">
            {product.quantityAvailable} kg available
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="farmer"
            className="flex-1"
            onClick={onAddToCart}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/products/${product._id}`)}
          >
            View
          </Button>
        </div>
        
        <div className="mt-3 text-sm text-gray-500">
          by {product.farmer?.fullName || 'Local Farmer'}
        </div>
      </CardContent>
    </Card>
  )
}

// Skeleton Loader
const ProductCardSkeleton = () => (
  <Card className="overflow-hidden">
    <div className="w-full h-48 bg-gray-200 animate-pulse" />
    <CardContent className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
      <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
      <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3" />
      <div className="h-10 bg-gray-200 rounded animate-pulse" />
    </CardContent>
  </Card>
)

export default Products