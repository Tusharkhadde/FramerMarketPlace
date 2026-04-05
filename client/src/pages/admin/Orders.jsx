import { useState } from 'react'
import {
  Search, Filter, Eye, Download, ShoppingCart,
  Package, Truck, CheckCircle, XCircle, Clock,
  IndianRupee, MoreVertical, MapPin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatPrice, formatDate, cn } from '@/lib/utils'

const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  confirmed: { color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  processing: { color: 'bg-purple-100 text-purple-700', icon: Package },
  packed: { color: 'bg-indigo-100 text-indigo-700', icon: Package },
  shipped: { color: 'bg-cyan-100 text-cyan-700', icon: Truck },
  delivered: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { color: 'bg-red-100 text-red-700', icon: XCircle },
}

const dummyOrders = [
  { _id: '1', orderNumber: 'FM2412001', buyer: { fullName: 'Priya Sharma' }, itemCount: 3, total: 2500, orderStatus: 'confirmed', paymentMethod: 'online', paymentStatus: 'paid', district: 'Pune', createdAt: '2024-12-11' },
  { _id: '2', orderNumber: 'FM2412002', buyer: { fullName: 'Amit Deshmukh' }, itemCount: 1, total: 1200, orderStatus: 'shipped', paymentMethod: 'cod', paymentStatus: 'pending', district: 'Nashik', createdAt: '2024-12-10' },
  { _id: '3', orderNumber: 'FM2412003', buyer: { fullName: 'Sneha Kulkarni' }, itemCount: 5, total: 4800, orderStatus: 'delivered', paymentMethod: 'online', paymentStatus: 'paid', district: 'Mumbai', createdAt: '2024-12-09' },
  { _id: '4', orderNumber: 'FM2412004', buyer: { fullName: 'Rahul Patil' }, itemCount: 2, total: 800, orderStatus: 'cancelled', paymentMethod: 'online', paymentStatus: 'refunded', district: 'Kolhapur', createdAt: '2024-12-08' },
  { _id: '5', orderNumber: 'FM2412005', buyer: { fullName: 'Meera Joshi' }, itemCount: 4, total: 3200, orderStatus: 'processing', paymentMethod: 'online', paymentStatus: 'paid', district: 'Solapur', createdAt: '2024-12-11' },
]

const AdminOrders = () => {
  const [orders] = useState(dummyOrders)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)

  const stats = {
    total: orders.length,
    active: orders.filter(o => !['delivered', 'cancelled'].includes(o.orderStatus)).length,
    delivered: orders.filter(o => o.orderStatus === 'delivered').length,
    cancelled: orders.filter(o => o.orderStatus === 'cancelled').length,
    revenue: orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0),
  }

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.buyer.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || o.orderStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Order Management</h1>
          <p className="text-muted-foreground mt-1">Track and manage all platform orders</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Orders', value: stats.total, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active', value: stats.active, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Delivered', value: stats.delivered, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Cancelled', value: stats.cancelled, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Revenue', value: formatPrice(stats.revenue), color: 'text-farmer-600', bg: 'bg-farmer-50' },
        ].map(s => (
          <Card key={s.label} className={s.bg}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search orders..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.keys(statusConfig).map(s => (
                  <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map(order => {
                  const StatusIcon = statusConfig[order.orderStatus]?.icon || Package
                  return (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.buyer.fullName}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{order.district}</p>
                        </div>
                      </TableCell>
                      <TableCell>{order.itemCount} items</TableCell>
                      <TableCell className="font-semibold text-farmer-600">{formatPrice(order.total)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant="outline" className="text-xs capitalize">{order.paymentMethod}</Badge>
                          <Badge className={cn('text-xs block w-fit',
                            order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                            order.paymentStatus === 'refunded' ? 'bg-purple-100 text-purple-700' :
                            'bg-yellow-100 text-yellow-700'
                          )}>
                            {order.paymentStatus}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig[order.orderStatus]?.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          <span className="capitalize">{order.orderStatus}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent>
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Order #{selectedOrder.orderNumber}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-muted-foreground">Buyer</p><p className="font-medium">{selectedOrder.buyer.fullName}</p></div>
                  <div><p className="text-muted-foreground">District</p><p className="font-medium">{selectedOrder.district}</p></div>
                  <div><p className="text-muted-foreground">Amount</p><p className="font-bold text-farmer-600">{formatPrice(selectedOrder.total)}</p></div>
                  <div><p className="text-muted-foreground">Status</p><Badge className={statusConfig[selectedOrder.orderStatus]?.color}>{selectedOrder.orderStatus}</Badge></div>
                  <div><p className="text-muted-foreground">Payment</p><p className="font-medium capitalize">{selectedOrder.paymentMethod} - {selectedOrder.paymentStatus}</p></div>
                  <div><p className="text-muted-foreground">Date</p><p className="font-medium">{formatDate(selectedOrder.createdAt)}</p></div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminOrders