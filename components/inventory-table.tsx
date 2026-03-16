"use client";

import { Product } from "@/lib/inventory-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Trash2 } from "lucide-react";
import { AddProductForm } from "@/components/add-product-form";
import { Button } from "@/components/ui/button";

interface InventoryTableProps {
  products: Product[];
  onAddProduct?: (product: Product) => void;
  onRemoveProduct?: (productId: string) => void;
}

export function InventoryTable({ products, onAddProduct, onRemoveProduct }: InventoryTableProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Package className="h-5 w-5" />
            Inventario de Productos
          </CardTitle>
          {onAddProduct && <AddProductForm onAddProduct={onAddProduct} />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Producto</TableHead>
                <TableHead className="text-right font-semibold">Costo ($)</TableHead>
                <TableHead className="text-right font-semibold">Gramos/Unidad</TableHead>
                <TableHead className="text-right font-semibold">Inventario (g)</TableHead>
                <TableHead className="text-right font-semibold">Ambiente (dias)</TableHead>
                <TableHead className="text-right font-semibold">Refrigerado (dias)</TableHead>
                <TableHead className="text-right font-semibold">Congelado (dias)</TableHead>
                {onRemoveProduct && <TableHead className="w-10"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product, index) => (
                <TableRow
                  key={product.id}
                  className={index % 2 === 0 ? "bg-card" : "bg-muted/20"}
                >
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-right">{product.cost.toFixed(1)}</TableCell>
                  <TableCell className="text-right">{product.gramsPerUnit.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{product.inventory.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{product.ambiente.toFixed(1)}</TableCell>
                  <TableCell className="text-right">{product.refrigerado.toFixed(1)}</TableCell>
                  <TableCell className="text-right">{product.congelado.toFixed(1)}</TableCell>
                  {onRemoveProduct && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveProduct(product.id)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
