import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { updateExpendableCount, addExpendable, dismissLowStockAlert } from '@/store/slices/cameraDepartmentSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  Package,
  Plus,
  Minus,
  AlertTriangle,
  Bell,
  X,
  Filter,
} from 'lucide-react';

const categories = ['All', 'Tape', 'Batteries', 'Cleaning', 'Grip', 'Filters', 'Other'];

export default function ExpendablesPage() {
  const dispatch = useDispatch();
  const { expendables, lowStockAlerts } = useSelector((state: RootState) => state.cameraDepartment);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    currentCount: 0,
    minimumThreshold: 0,
    unit: 'pcs',
  });
  
  const filteredExpendables = expendables.filter(e => {
    const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  const lowStockItems = expendables.filter(e => lowStockAlerts.includes(e.id));
  
  const handleCountChange = (id: string, delta: number) => {
    dispatch(updateExpendableCount({
      id,
      delta,
      userId: user?.id || 'anonymous',
    }));
    
    const item = expendables.find(e => e.id === id);
    if (item) {
      const newCount = item.currentCount + delta;
      if (newCount < item.minimumThreshold && delta < 0) {
        toast.warning(`Low stock alert: ${item.name}`);
      }
    }
  };
  
  const handleAddItem = () => {
    if (!newItem.name || !newItem.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    dispatch(addExpendable({
      ...newItem,
      updatedBy: user?.id || 'anonymous',
    }));
    
    setAddDialogOpen(false);
    setNewItem({
      name: '',
      category: '',
      currentCount: 0,
      minimumThreshold: 0,
      unit: 'pcs',
    });
    toast.success('Expendable item added');
  };
  
  const handleDismissAlert = (id: string) => {
    dispatch(dismissLowStockAlert(id));
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Expendables Tracker</h1>
          <p className="text-muted-foreground">Track consumable inventory with alerts</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Expendable Item</DialogTitle>
              <DialogDescription>Add a new consumable to track</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Item Name *</Label>
                <Input
                  placeholder="e.g., Gaffer Tape (Black)"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={newItem.category}
                  onValueChange={(v) => setNewItem({ ...newItem, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c !== 'All').map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Initial Count</Label>
                  <Input
                    type="number"
                    value={newItem.currentCount}
                    onChange={(e) => setNewItem({ ...newItem, currentCount: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Min. Threshold</Label>
                  <Input
                    type="number"
                    value={newItem.minimumThreshold}
                    onChange={(e) => setNewItem({ ...newItem, minimumThreshold: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select
                  value={newItem.unit}
                  onValueChange={(v) => setNewItem({ ...newItem, unit: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pcs">Pieces</SelectItem>
                    <SelectItem value="rolls">Rolls</SelectItem>
                    <SelectItem value="boxes">Boxes</SelectItem>
                    <SelectItem value="cans">Cans</SelectItem>
                    <SelectItem value="sheets">Sheets</SelectItem>
                    <SelectItem value="packs">Packs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddItem}>Add Item</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <Bell className="h-4 w-4 text-yellow-500" />
          <AlertTitle className="text-yellow-500">Low Stock Alerts</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              {lowStockItems.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 bg-background/50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">{item.name}</span>
                    <Badge variant="destructive">
                      {item.currentCount} / {item.minimumThreshold} {item.unit}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleDismissAlert(item.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search expendables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{expendables.length}</div>
            <div className="text-sm text-muted-foreground">Total Items</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-500">{lowStockAlerts.length}</div>
            <div className="text-sm text-muted-foreground">Low Stock</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-500">
              {expendables.filter(e => e.currentCount >= e.minimumThreshold).length}
            </div>
            <div className="text-sm text-muted-foreground">Well Stocked</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{categories.length - 1}</div>
            <div className="text-sm text-muted-foreground">Categories</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Expendables List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExpendables.map(item => {
          const isLowStock = item.currentCount < item.minimumThreshold;
          return (
            <Card
              key={item.id}
              className={isLowStock ? 'border-yellow-500/50' : ''}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      {item.name}
                      {isLowStock && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                    </h3>
                    <Badge variant="outline" className="mt-1">{item.category}</Badge>
                  </div>
                </div>
                
                {/* Counter */}
                <div className="flex items-center justify-center gap-4 py-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full"
                    onClick={() => handleCountChange(item.id, -1)}
                    disabled={item.currentCount === 0}
                  >
                    <Minus className="w-6 h-6" />
                  </Button>
                  <div className="text-center min-w-[80px]">
                    <div className={`text-3xl font-bold ${isLowStock ? 'text-yellow-500' : ''}`}>
                      {item.currentCount}
                    </div>
                    <div className="text-xs text-muted-foreground">{item.unit}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full"
                    onClick={() => handleCountChange(item.id, 1)}
                  >
                    <Plus className="w-6 h-6" />
                  </Button>
                </div>
                
                {/* Threshold indicator */}
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Stock Level</span>
                    <span>Min: {item.minimumThreshold}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        isLowStock ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{
                        width: `${Math.min(100, (item.currentCount / (item.minimumThreshold * 2)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mt-3">
                  Last updated: {new Date(item.lastUpdated).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {filteredExpendables.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No items found</h3>
            <p className="text-muted-foreground">
              {searchTerm || categoryFilter !== 'All'
                ? 'Try adjusting your filters'
                : 'Add your first expendable item'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
