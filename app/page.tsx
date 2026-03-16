"use client";

import { useState } from "react";
import { INITIAL_PRODUCTS, Product } from "@/lib/inventory-data";
import { InventoryTable } from "@/components/inventory-table";
import { CapacityAlerts } from "@/components/capacity-alerts";
import { StatsHeader } from "@/components/stats-header";
import { RecipesTable } from "@/components/recipes-table";
import { WeeklyMenuPlanner } from "@/components/weekly-menu-planner";
import { OptimizedMenu } from "@/components/optimized-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Calendar, ChefHat, Zap } from "lucide-react";

export default function InventoryManager() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  const handleAddProduct = (product: Product) => {
    setProducts((prev) => [...prev, product]);
  };

  const handleRemoveProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-4 py-6 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
              <span className="text-xl font-bold">AM</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary md:text-4xl">
                Arca Monarca
              </h1>
              <p className="text-sm text-muted-foreground">
                Administrador de Inventario y Menus
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        {/* Stats Header */}
        <section className="mb-6">
          <StatsHeader products={products} />
        </section>

        {/* Tabs */}
        <Tabs defaultValue="optimize" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-grid">
            <TabsTrigger value="optimize" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Optimizar</span>
            </TabsTrigger>
            <TabsTrigger value="planner" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Menu Manual</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Inventario</span>
            </TabsTrigger>
            <TabsTrigger value="recipes" className="flex items-center gap-2">
              <ChefHat className="h-4 w-4" />
              <span className="hidden sm:inline">Recetas</span>
            </TabsTrigger>
          </TabsList>

          {/* Optimized Menu Tab */}
          <TabsContent value="optimize" className="space-y-6">
            <OptimizedMenu />
          </TabsContent>

          {/* Weekly Menu Planner Tab */}
          <TabsContent value="planner" className="space-y-6">
            <WeeklyMenuPlanner products={products} />
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <InventoryTable
                  products={products}
                  onAddProduct={handleAddProduct}
                  onRemoveProduct={handleRemoveProduct}
                />
              </div>
              <div>
                <CapacityAlerts products={products} />
              </div>
            </div>
          </TabsContent>

          {/* Recipes Tab */}
          <TabsContent value="recipes" className="space-y-6">
            <RecipesTable />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card px-4 py-4 text-center text-sm text-muted-foreground md:px-8">
        <p>Casa Monarca - Sistema de Administracion de Inventario y Menus</p>
      </footer>
    </div>
  );
}
