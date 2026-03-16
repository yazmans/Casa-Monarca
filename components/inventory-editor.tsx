"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
export interface ProductConfig {
  name: string;
  cost: number;
  gramsPerUnit: number;
  stock: number; // restante en gramos
}

// ── Defaults (mirrors Python model) ───────────────────────────────────────
export const DEFAULT_INVENTORY: ProductConfig[] = [
  { name: "Arroz",     cost: 16.9,  gramsPerUnit: 900,  stock: 100000 },
  { name: "Calabacita",cost: 29.9,  gramsPerUnit: 1000, stock: 0      },
  { name: "Zanahoria", cost: 15.9,  gramsPerUnit: 1000, stock: 0      },
  { name: "Papa",      cost: 19.9,  gramsPerUnit: 1000, stock: 0      },
  { name: "Atun",      cost: 14.1,  gramsPerUnit: 140,  stock: 7280   },
  { name: "Pollo",     cost: 94.0,  gramsPerUnit: 1000, stock: 0      },
  { name: "Res",       cost: 109.0, gramsPerUnit: 1000, stock: 0      },
  { name: "Pasta",     cost: 11.1,  gramsPerUnit: 200,  stock: 60000  },
  { name: "Frijoles",  cost: 26.5,  gramsPerUnit: 908,  stock: 330000 },
  { name: "Jitomate",  cost: 49.9,  gramsPerUnit: 1000, stock: 0      },
  { name: "Mojarra",   cost: 109.0, gramsPerUnit: 1000, stock: 0      },
  { name: "Huevo",     cost: 50.0,  gramsPerUnit: 1000, stock: 0      },
  { name: "Jamon",     cost: 120.0, gramsPerUnit: 1000, stock: 0      },
  { name: "Avena",     cost: 30.0,  gramsPerUnit: 1000, stock: 0      },
  { name: "Leche",     cost: 28.0,  gramsPerUnit: 1000, stock: 0      },
  { name: "Bolillo",   cost: 18.0,  gramsPerUnit: 1000, stock: 0      },
];

const PROTEINS = new Set(["Atun", "Pollo", "Res", "Mojarra", "Huevo", "Jamon"]);

// ── Component ──────────────────────────────────────────────────────────────
interface Props {
  inventory: ProductConfig[];
  onChange: (updated: ProductConfig[]) => void;
}

export function InventoryEditor({ inventory, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const update = (idx: number, field: "cost" | "stock" | "gramsPerUnit", raw: string) => {
    const value = parseFloat(raw);
    if (isNaN(value) || value < 0) return;
    const next = inventory.map((p, i) => (i === idx ? { ...p, [field]: value } : p));
    onChange(next);
  };

  const reset = () => onChange(DEFAULT_INVENTORY.map((p) => ({ ...p })));

  const changedCount = inventory.filter((p, i) => {
    const d = DEFAULT_INVENTORY[i];
    return p.cost !== d.cost || p.stock !== d.stock || p.gramsPerUnit !== d.gramsPerUnit;
  }).length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Package className="h-5 w-5" />
            Inventario Inicial y Precios
            {changedCount > 0 && (
              <Badge variant="secondary" className="ml-1">{changedCount} modificado{changedCount > 1 ? "s" : ""}</Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            {changedCount > 0 && (
              <Button variant="ghost" size="sm" onClick={reset} className="gap-1 text-muted-foreground">
                <RotateCcw className="h-3 w-3" /> Restablecer
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setOpen((o) => !o)} className="gap-1">
              {open ? <><ChevronUp className="h-4 w-4" /> Ocultar</> : <><ChevronDown className="h-4 w-4" /> Editar</>}
            </Button>
          </div>
        </div>
      </CardHeader>

      {open && (
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="pb-2 text-left font-semibold">Producto</th>
                  <th className="pb-2 text-center font-semibold">Tipo</th>
                  <th className="pb-2 text-center font-semibold">Stock actual (g)</th>
                  <th className="pb-2 text-center font-semibold">Costo/paquete ($)</th>
                  <th className="pb-2 text-center font-semibold">g/paquete</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((p, idx) => {
                  const def = DEFAULT_INVENTORY[idx];
                  const changed = p.cost !== def.cost || p.stock !== def.stock || p.gramsPerUnit !== def.gramsPerUnit;
                  return (
                    <tr key={p.name} className={`border-b last:border-0 ${changed ? "bg-amber-50" : ""}`}>
                      <td className="py-1.5 pr-3 font-medium">{p.name}</td>
                      <td className="py-1.5 px-2 text-center">
                        <Badge variant="outline" className={PROTEINS.has(p.name) ? "border-rose-300 text-rose-700" : "border-green-300 text-green-700"}>
                          {PROTEINS.has(p.name) ? "Proteína" : "Guarnición"}
                        </Badge>
                      </td>
                      <td className="py-1.5 px-2">
                        <Input
                          type="number" min="0" step="100"
                          value={p.stock}
                          onChange={(e) => update(idx, "stock", e.target.value)}
                          className="h-7 w-28 text-center text-xs mx-auto"
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <Input
                          type="number" min="0" step="0.1"
                          value={p.cost}
                          onChange={(e) => update(idx, "cost", e.target.value)}
                          className="h-7 w-24 text-center text-xs mx-auto"
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <Input
                          type="number" min="1" step="1"
                          value={p.gramsPerUnit}
                          onChange={(e) => update(idx, "gramsPerUnit", e.target.value)}
                          className="h-7 w-24 text-center text-xs mx-auto"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Las filas en amarillo tienen valores distintos al predeterminado.
          </p>
        </CardContent>
      )}
    </Card>
  );
}
