"use client";

import { STORAGE_CAPACITY, Product } from "@/lib/inventory-data";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Warehouse, Thermometer, Snowflake } from "lucide-react";

interface StatsHeaderProps {
  products?: Product[];
}

export function StatsHeader({ products = [] }: StatsHeaderProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {/* Total Products */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="rounded-full bg-primary/10 p-2">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Productos</p>
            <p className="text-2xl font-bold">{products.length}</p>
            <p className="text-xs text-muted-foreground">en inventario</p>
          </div>
        </CardContent>
      </Card>

      {/* Ambiente Capacity */}
      <Card className="border-l-4 border-l-secondary">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="rounded-full bg-secondary/10 p-2">
            <Warehouse className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ambiente</p>
            <p className="text-2xl font-bold">{STORAGE_CAPACITY.ambiente.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">litros máx</p>
          </div>
        </CardContent>
      </Card>

      {/* Refrigerador Capacity */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="rounded-full bg-blue-500/10 p-2">
            <Thermometer className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Refrigerador</p>
            <p className="text-2xl font-bold">{STORAGE_CAPACITY.refrigerador}</p>
            <p className="text-xs text-muted-foreground">litros máx</p>
          </div>
        </CardContent>
      </Card>

      {/* Congelador Capacity */}
      <Card className="border-l-4 border-l-cyan-500">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="rounded-full bg-cyan-500/10 p-2">
            <Snowflake className="h-5 w-5 text-cyan-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Congelador</p>
            <p className="text-2xl font-bold">{STORAGE_CAPACITY.congelador}</p>
            <p className="text-xs text-muted-foreground">litros máx</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
