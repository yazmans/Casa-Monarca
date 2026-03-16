"use client";

import { useState, DragEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Zap, DollarSign, ShoppingCart, Loader2, AlertTriangle,
  GripVertical, RefreshCw, Users, UserRound, Utensils,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InventoryEditor, DEFAULT_INVENTORY, type ProductConfig } from "@/components/inventory-editor";
import { RecipeEditor, type CustomRecipe } from "@/components/recipe-editor";

// ── Types ──────────────────────────────────────────────────────────────────
interface SizeParams { count: number; gramProt: number; gramComp: number }
interface PersonParams { pequena: SizeParams; mediana: SizeParams; grande: SizeParams }

interface MealInfo {
  protein: string | null;
  garnish:  string | null;
  proteinGrams: number;
  garnishGrams: number;
}
interface MenuDay {
  day: string;
  dayName: string;
  meals: Record<string, MealInfo>; // key = "Desayuno" | "Comida" | "Cena"
}
interface Purchase { product: string; storage: string; units: number; cost: number }
interface OptimizeResult {
  status: string; cost: number;
  menu: MenuDay[]; purchases: Purchase[];
  reqProtComida: number; reqCompComida: number;
  factorPorcion: Record<string, number>;
  error?: string;
}

// ── Display maps ───────────────────────────────────────────────────────────
const PROTEIN_COLORS: Record<string, string> = {
  Atun:    "bg-sky-100 border-sky-400 text-sky-800",
  Pollo:   "bg-amber-100 border-amber-400 text-amber-800",
  Res:     "bg-rose-100 border-rose-400 text-rose-800",
  Mojarra: "bg-teal-100 border-teal-400 text-teal-800",
  Huevo:   "bg-yellow-100 border-yellow-400 text-yellow-800",
  Jamon:   "bg-pink-100 border-pink-400 text-pink-800",
};

const GARNISH_COLORS: Record<string, string> = {
  ArrozCalabacita: "bg-green-100 border-green-400 text-green-800",
  PapasZanahoria:  "bg-orange-100 border-orange-400 text-orange-800",
  ArrozJitomate:   "bg-lime-100 border-lime-400 text-lime-800",
  PastaJitomate:   "bg-red-100 border-red-400 text-red-800",
  FrijolesPapa:    "bg-stone-100 border-stone-400 text-stone-800",
  PastaCalabacita: "bg-emerald-100 border-emerald-400 text-emerald-800",
  AvenaLeche:      "bg-blue-100 border-blue-400 text-blue-800",
  BolilloFrijol:   "bg-purple-100 border-purple-400 text-purple-800",
};

const GARNISH_LABELS: Record<string, string> = {
  ArrozCalabacita: "Arroz c/Calabacita",
  PapasZanahoria:  "Papas c/Zanahoria",
  ArrozJitomate:   "Arroz c/Jitomate",
  PastaJitomate:   "Pasta c/Jitomate",
  FrijolesPapa:    "Frijoles c/Papa",
  PastaCalabacita: "Pasta c/Calabacita",
  AvenaLeche:      "Avena c/Leche",
  BolilloFrijol:   "Bolillo c/Frijol",
};

const MEAL_ICONS: Record<string, string> = {
  Desayuno: "☀️",
  Comida:   "🍽️",
  Cena:     "🌙",
};

const STORAGE_LABELS: Record<string, string> = {
  Ambiente: "Ambiente", Refrigerado: "Refrigerado", Congelado: "Congelado",
};

const DAYS  = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];
const MEALS = ["Desayuno", "Comida", "Cena"];
const SIZE_LABELS = [
  { key: "pequena" as const, label: "Pequeña" },
  { key: "mediana" as const, label: "Mediana" },
  { key: "grande"  as const, label: "Grande"  },
];
const DEFAULT_PARAMS: PersonParams = {
  pequena: { count: 12, gramProt: 100, gramComp: 52.5  },
  mediana: { count: 61, gramProt: 180, gramComp: 92.5  },
  grande:  { count: 7,  gramProt: 250, gramComp: 140.0 },
};

// ── Drag ───────────────────────────────────────────────────────────────────
type DragKind = "protein" | "garnish";
interface DragPayload { kind: DragKind; value: string; fromDay: number; meal: string }

// ======================================================================
// Component
// ======================================================================
export function OptimizedMenu() {
  const [params, setParams]         = useState<PersonParams>(DEFAULT_PARAMS);
  const [inventory, setInventory]   = useState<ProductConfig[]>(DEFAULT_INVENTORY.map((p) => ({ ...p })));
  const [customRecipes, setCustomRecipes] = useState<CustomRecipe[]>([]);
  const [menu, setMenu]             = useState<MenuDay[] | null>(null);
  const [result, setResult]         = useState<OptimizeResult | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const [dragging,    setDragging]    = useState<DragPayload | null>(null);
  const [dropTarget,  setDropTarget]  = useState<{ day: number; meal: string } | null>(null);

  const totalPersons = params.pequena.count + params.mediana.count + params.grande.count;

  // ── Param helpers ────────────────────────────────────────────────────────
  const setField = (size: keyof PersonParams, field: keyof SizeParams, raw: string) => {
    const value = parseFloat(raw);
    if (isNaN(value) || value < 0) return;
    setParams((prev) => ({
      ...prev,
      [size]: { ...prev[size], [field]: field === "count" ? Math.floor(value) : value },
    }));
  };

  // ── Optimize ─────────────────────────────────────────────────────────────
  const handleOptimize = async () => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ params, inventory, customRecipes }),
      });
      const data: OptimizeResult = await res.json();
      if (data.status !== "Optimal") {
        setError(data.error ?? "Sin solución óptima");
      } else {
        setResult(data);
        setMenu(data.menu);
      }
    } catch {
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const onDragStart = (e: DragEvent, payload: DragPayload) => {
    setDragging(payload);
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragOver = (e: DragEvent, day: number, meal: string) => {
    e.preventDefault();
    if (dragging?.meal === meal) setDropTarget({ day, meal });
  };
  const onDragLeave = () => setDropTarget(null);

  const onDrop = (e: DragEvent, toDay: number, meal: string) => {
    e.preventDefault();
    setDropTarget(null);
    if (!dragging || !menu || dragging.meal !== meal) { setDragging(null); return; }

    const fromDay = dragging.fromDay;
    if (fromDay === toDay) { setDragging(null); return; }

    const newMenu = menu.map((d) => ({
      ...d,
      meals: Object.fromEntries(
        Object.entries(d.meals).map(([k, v]) => [k, { ...v }])
      ),
    }));

    if (dragging.kind === "protein") {
      const tmp = newMenu[fromDay].meals[meal].protein;
      newMenu[fromDay].meals[meal].protein = newMenu[toDay].meals[meal].protein;
      newMenu[toDay].meals[meal].protein   = tmp;
    } else {
      const tmp = newMenu[fromDay].meals[meal].garnish;
      newMenu[fromDay].meals[meal].garnish = newMenu[toDay].meals[meal].garnish;
      newMenu[toDay].meals[meal].garnish   = tmp;
    }

    setMenu(newMenu);
    setDragging(null);
  };
  const onDragEnd = () => { setDragging(null); setDropTarget(null); };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Person / Portion Inputs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Users className="h-5 w-5" />
            Personas y Porciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 text-left font-semibold text-muted-foreground">Tamaño</th>
                  <th className="pb-2 text-center font-semibold text-muted-foreground">Personas</th>
                  <th className="pb-2 text-center font-semibold text-muted-foreground">Proteína (g/persona)</th>
                  <th className="pb-2 text-center font-semibold text-muted-foreground">Guarnición (g/persona)</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_LABELS.map(({ key, label }) => (
                  <tr key={key} className="border-b last:border-0">
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <UserRound className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{label}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <Input type="number" min="0"
                        value={params[key].count}
                        onChange={(e) => setField(key, "count", e.target.value)}
                        className="h-8 w-24 text-center font-semibold mx-auto" />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <Input type="number" min="0" step="1"
                        value={params[key].gramProt}
                        onChange={(e) => setField(key, "gramProt", e.target.value)}
                        className="h-8 w-24 text-center mx-auto" />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <Input type="number" min="0" step="0.5"
                        value={params[key].gramComp}
                        onChange={(e) => setField(key, "gramComp", e.target.value)}
                        className="h-8 w-24 text-center mx-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="pt-3 font-semibold">Total</td>
                  <td className="pt-3 text-center font-bold text-primary">{totalPersons}</td>
                  <td colSpan={2} className="pt-3 text-center text-xs text-muted-foreground">
                    Ref. Comida — Prot:{" "}
                    {(params.pequena.count * params.pequena.gramProt +
                      params.mediana.count * params.mediana.gramProt +
                      params.grande.count  * params.grande.gramProt).toLocaleString()} g &nbsp;|&nbsp;
                    Guarn:{" "}
                    {((params.pequena.count * params.pequena.gramComp +
                       params.mediana.count * params.mediana.gramComp +
                       params.grande.count  * params.grande.gramComp) * 2).toLocaleString()} g
                    &nbsp;(Desayuno/Cena × 0.5)
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      

      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardContent className="py-5">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-primary">Optimización del Menú Semanal</h2>
              <p className="text-sm text-muted-foreground mt-1">
                3 comidas/día · 7 días · minimiza costo para{" "}
                <span className="font-semibold text-foreground">{totalPersons} personas</span>
              </p>
            </div>
            <Button size="lg" className="gap-2 min-w-[180px]"
              onClick={handleOptimize} disabled={loading || totalPersons === 0}>
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Optimizando…</>
                : <><Zap className="h-4 w-4" /> {menu ? "Re-Optimizar" : "Optimizar Menú"}</>
              }
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Cost summary */}
      {result && menu && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Costo Total Optimizado</p>
                  <p className="text-2xl font-bold text-primary">
                    ${result.cost.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Proteína (Comida)</p>
                <p className="text-lg font-semibold">{result.reqProtComida.toLocaleString()} g</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Guarnición (Comida)</p>
                <p className="text-lg font-semibold">{result.reqCompComida.toLocaleString()} g</p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto gap-1"
                onClick={() => setMenu(result.menu)}>
                <RefreshCw className="h-3 w-3" /> Restablecer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Drag hint */}
      {menu && (
        <p className="text-xs text-muted-foreground">
          💡 Arrastra proteínas o guarniciones entre días de la misma comida para intercambiarlas.
        </p>
      )}

      {/* ── Weekly grid ── */}
      {menu && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Utensils className="h-5 w-5" />
              Menú Semanal (3 comidas × 7 días)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                {/* Header */}
                <div className="grid grid-cols-8 gap-2 mb-3">
                  <div />
                  {DAYS.map((d) => (
                    <div key={d} className="rounded-lg bg-muted/50 p-2 text-center text-sm font-semibold">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Meal rows */}
                {MEALS.map((meal) => (
                  <div key={meal} className="grid grid-cols-8 gap-2 mb-2">
                    {/* Meal label */}
                    <div className="flex items-center justify-center rounded-lg bg-secondary/10 p-2 text-sm font-medium text-secondary">
                      <span className="mr-1">{MEAL_ICONS[meal]}</span>
                      {meal}
                    </div>

                    {/* Day cells */}
                    {menu.map((day, dayIdx) => {
                      const info = day.meals[meal];
                      const isTarget = dropTarget?.day === dayIdx && dropTarget?.meal === meal;

                      return (
                        <div
                          key={day.day}
                          onDragOver={(e) => onDragOver(e, dayIdx, meal)}
                          onDragLeave={onDragLeave}
                          onDrop={(e) => onDrop(e, dayIdx, meal)}
                          className={cn(
                            "min-h-24 rounded-lg border-2 p-2 transition-all flex flex-col gap-1",
                            isTarget
                              ? "border-primary bg-primary/10 scale-[1.02] border-solid"
                              : "border-dashed border-muted/60 bg-card"
                          )}
                        >
                          {/* Protein */}
                          {info?.protein ? (
                            <div
                              draggable
                              onDragStart={(e) => onDragStart(e, { kind: "protein", value: info.protein!, fromDay: dayIdx, meal })}
                              onDragEnd={onDragEnd}
                              className={cn(
                                "flex items-center gap-1 rounded border px-1.5 py-1 text-xs font-medium cursor-grab active:cursor-grabbing",
                                PROTEIN_COLORS[info.protein] ?? "bg-muted border-muted-foreground/30"
                              )}
                            >
                              <GripVertical className="h-2.5 w-2.5 opacity-50 shrink-0" />
                              <span className="truncate">{info.protein}</span>
                            </div>
                          ) : (
                            <div className="rounded border border-dashed border-muted/50 px-1.5 py-0.5 text-center text-[10px] text-muted-foreground">
                              sin proteína
                            </div>
                          )}

                          <div className="border-t border-dashed border-muted/30" />

                          {/* Garnish */}
                          {info?.garnish ? (
                            <div
                              draggable
                              onDragStart={(e) => onDragStart(e, { kind: "garnish", value: info.garnish!, fromDay: dayIdx, meal })}
                              onDragEnd={onDragEnd}
                              className={cn(
                                "flex items-center gap-1 rounded border px-1.5 py-1 text-[10px] font-medium cursor-grab active:cursor-grabbing",
                                GARNISH_COLORS[info.garnish] ?? "bg-muted border-muted-foreground/30"
                              )}
                            >
                              <GripVertical className="h-2.5 w-2.5 opacity-50 shrink-0" />
                              <span className="truncate">{GARNISH_LABELS[info.garnish] ?? info.garnish}</span>
                            </div>
                          ) : (
                            <div className="rounded border border-dashed border-muted/50 px-1.5 py-0.5 text-center text-[10px] text-muted-foreground">
                              sin guarnición
                            </div>
                          )}

                          {/* Grams */}
                          {info && (
                            <p className="text-[9px] text-muted-foreground text-right mt-auto">
                              {info.proteinGrams.toLocaleString()}g prot
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Purchases table */}
      {result && result.purchases.length > 0 && (
        <Card className="border-secondary/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-secondary">
                <ShoppingCart className="h-5 w-5" />
                Lista de Compras
              </CardTitle>
              <Badge variant="secondary" className="text-base px-3 py-1">
                Total: ${result.cost.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Producto</TableHead>
                  <TableHead>Almacenamiento</TableHead>
                  <TableHead className="text-right">Paquetes</TableHead>
                  <TableHead className="text-right">Costo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.purchases.map((p, i) => (
                  <TableRow key={i} className={i % 2 === 0 ? "bg-card" : "bg-muted/20"}>
                    <TableCell className="font-medium">{p.product}</TableCell>
                    <TableCell><Badge variant="outline">{STORAGE_LABELS[p.storage]}</Badge></TableCell>
                    <TableCell className="text-right">{p.units}</TableCell>
                    <TableCell className="text-right font-semibold">
                      ${p.cost.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
