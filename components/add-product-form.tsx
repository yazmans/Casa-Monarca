"use client";

import { useState } from "react";
import { Product } from "@/lib/inventory-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AddProductFormProps {
  onAddProduct: (product: Product) => void;
}

export function AddProductForm({ onAddProduct }: AddProductFormProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    cost: "",
    gramsPerUnit: "",
    inventory: "",
    ambiente: "",
    refrigerado: "",
    congelado: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      id: Date.now().toString(),
      name: formData.name,
      cost: parseFloat(formData.cost) || 0,
      gramsPerUnit: parseFloat(formData.gramsPerUnit) || 0,
      inventory: parseFloat(formData.inventory) || 0,
      ambiente: parseFloat(formData.ambiente) || 0,
      refrigerado: parseFloat(formData.refrigerado) || 0,
      congelado: parseFloat(formData.congelado) || 0,
    };
    onAddProduct(newProduct);
    setFormData({
      name: "",
      cost: "",
      gramsPerUnit: "",
      inventory: "",
      ambiente: "",
      refrigerado: "",
      congelado: "",
    });
    setOpen(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Agregar Producto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Plus className="h-5 w-5" />
            Nuevo Producto
          </DialogTitle>
          <DialogDescription>
            Ingresa los datos del nuevo producto para agregarlo al inventario.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre del Producto</label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Ej: Tomate"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Costo ($)</label>
              <Input
                type="number"
                step="0.1"
                value={formData.cost}
                onChange={(e) => handleChange("cost", e.target.value)}
                placeholder="0.0"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Gramos/Unidad</label>
              <Input
                type="number"
                value={formData.gramsPerUnit}
                onChange={(e) => handleChange("gramsPerUnit", e.target.value)}
                placeholder="1000"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Inventario (gramos)</label>
            <Input
              type="number"
              value={formData.inventory}
              onChange={(e) => handleChange("inventory", e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Dias de Vida Util
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Ambiente</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.ambiente}
                  onChange={(e) => handleChange("ambiente", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Refrigerado</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.refrigerado}
                  onChange={(e) => handleChange("refrigerado", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Congelado</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.congelado}
                  onChange={(e) => handleChange("congelado", e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Agregar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
