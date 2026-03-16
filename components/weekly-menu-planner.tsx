"use client";

import { useState, DragEvent } from "react";
import {
  Recipe,
  Product,
  RECIPES,
  calculateRecipeNeedsCustom,
  calculateTotalGramsNeededCustom,
  SIZE_SEGMENTS,
  PersonCounts,
} from "@/lib/inventory-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  ChefHat,
  DollarSign,
  Users,
  UserRound,
  GripVertical,
  X,
  Utensils,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  Beef,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// ── Constants ──────────────────────────────────────────────────────────────
const DAYS  = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];
const MEALS = ["Desayuno", "Comida", "Cena"];

const PROTEIN_NAMES = ["Atún", "Pollo", "Res", "Mojarra", "Huevo", "Jamón"];

const PROTEIN_COLORS: Record<string, string> = {
  "Atún":   "bg-sky-100 border-sky-400 text-sky-800",
  "Pollo":  "bg-amber-100 border-amber-400 text-amber-800",
  "Res":    "bg-rose-100 border-rose-400 text-rose-800",
  "Mojarra":"bg-teal-100 border-teal-400 text-teal-800",
  "Huevo":  "bg-yellow-100 border-yellow-400 text-yellow-800",
  "Jamón":  "bg-pink-100 border-pink-400 text-pink-800",
};

// ── Types ──────────────────────────────────────────────────────────────────
interface Slot {
  protein: string | null;
  garnish: Recipe | null;
}

type DragItem =
  | { kind: "protein"; value: string }
  | { kind: "garnish"; value: Recipe };

interface WeeklyMenuPlannerProps {
  products: Product[];
}

// ── Helpers ────────────────────────────────────────────────────────────────
function proteinCostForSlot(
  proteinName: string,
  products: Product[],
  personCounts: PersonCounts
): number {
  const product = products.find((p) => p.name === proteinName);
  if (!product) return 0;
  const { proteinGrams } = calculateTotalGramsNeededCustom(personCounts);
  const units = Math.ceil(proteinGrams / product.gramsPerUnit);
  return units * product.cost;
}

function slotCost(
  slot: Slot,
  products: Product[],
  personCounts: PersonCounts
): number {
  let cost = 0;
  if (slot.protein)
    cost += proteinCostForSlot(slot.protein, products, personCounts);
  if (slot.garnish)
    cost += calculateRecipeNeedsCustom(slot.garnish, products, personCounts).totalCost;
  return cost;
}

function emptyGrid(): Slot[][] {
  return Array(7).fill(null).map(() =>
    Array(3).fill(null).map(() => ({ protein: null, garnish: null }))
  );
}

// ======================================================================
// Component
// ======================================================================
export function WeeklyMenuPlanner({ products }: WeeklyMenuPlannerProps) {
  const [personCounts, setPersonCounts] = useState<PersonCounts>({
    pequena: 12,
    mediana: 61,
    grande: 7,
  });

  const [weeklyMenu, setWeeklyMenu] = useState<Slot[][]>(emptyGrid());

  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{ day: number; meal: number } | null>(null);

  const totalPersons = personCounts.pequena + personCounts.mediana + personCounts.grande;

  // ── Person counts ────────────────────────────────────────────────────────
  const handlePersonCountChange = (size: keyof PersonCounts, value: string) => {
    setPersonCounts((prev) => ({ ...prev, [size]: Math.max(0, parseInt(value) || 0) }));
  };

  // ── Drag ─────────────────────────────────────────────────────────────────
  const onDragStart = (e: DragEvent, item: DragItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "copy";
  };

  const onDragOver = (e: DragEvent, day: number, meal: number) => {
    e.preventDefault();
    setDragOverSlot({ day, meal });
  };

  const onDragLeave = () => setDragOverSlot(null);

  const onDrop = (e: DragEvent, day: number, meal: number) => {
    e.preventDefault();
    if (!draggedItem) { setDragOverSlot(null); return; }

    setWeeklyMenu((prev) => {
      const next = prev.map((d) => d.map((s) => ({ ...s })));
      if (draggedItem.kind === "protein") {
        next[day][meal].protein = draggedItem.value;
      } else {
        next[day][meal].garnish = draggedItem.value;
      }
      return next;
    });

    setDraggedItem(null);
    setDragOverSlot(null);
  };

  const removeProtein = (day: number, meal: number) =>
    setWeeklyMenu((prev) => {
      const next = prev.map((d) => d.map((s) => ({ ...s })));
      next[day][meal].protein = null;
      return next;
    });

  const removeGarnish = (day: number, meal: number) =>
    setWeeklyMenu((prev) => {
      const next = prev.map((d) => d.map((s) => ({ ...s })));
      next[day][meal].garnish = null;
      return next;
    });

  const handleClearAll = () => setWeeklyMenu(emptyGrid());

  // ── Cost totals ───────────────────────────────────────────────────────────
  let totalCost = 0;
  let mealCount = 0;
  weeklyMenu.forEach((day) =>
    day.forEach((slot) => {
      const c = slotCost(slot, products, personCounts);
      if (c > 0 || slot.protein || slot.garnish) {
        totalCost += c;
        mealCount++;
      }
    })
  );
  const costPerPerson = totalPersons > 0 && mealCount > 0 ? totalCost / totalPersons : 0;

  // ── Shopping list ─────────────────────────────────────────────────────────
  const calculateShoppingList = () => {
    const map: Record<string, {
      name: string; totalGrams: number; unitsNeeded: number;
      unitCost: number; totalCost: number; gramsPerUnit: number;
      inventoryAvailable: number; needToBuy: number;
    }> = {};

    const addIngredient = (name: string, grams: number) => {
      const product = products.find((p) => p.name === name);
      if (!product) return;
      if (!map[name]) {
        map[name] = {
          name, totalGrams: 0, unitsNeeded: 0,
          unitCost: product.cost, totalCost: 0,
          gramsPerUnit: product.gramsPerUnit,
          inventoryAvailable: product.inventory,
          needToBuy: 0,
        };
      }
      map[name].totalGrams += grams;
    };

    const { proteinGrams } = calculateTotalGramsNeededCustom(personCounts);

    weeklyMenu.forEach((day) =>
      day.forEach((slot) => {
        if (slot.protein) addIngredient(slot.protein, proteinGrams);
        if (slot.garnish) {
          const needs = calculateRecipeNeedsCustom(slot.garnish, products, personCounts);
          addIngredient(needs.ingredient1.name, needs.ingredient1.gramsNeeded);
          addIngredient(needs.ingredient2.name, needs.ingredient2.gramsNeeded);
        }
      })
    );

    Object.values(map).forEach((item) => {
      item.unitsNeeded = Math.ceil(item.totalGrams / item.gramsPerUnit);
      item.totalCost   = item.unitsNeeded * item.unitCost;
      const gramsFromInv  = Math.min(item.inventoryAvailable, item.totalGrams);
      item.needToBuy   = Math.ceil(Math.max(0, item.totalGrams - gramsFromInv) / item.gramsPerUnit);
    });

    return Object.values(map).sort((a, b) => b.totalCost - a.totalCost);
  };

  const shoppingList = calculateShoppingList();
  const totalShoppingCost = shoppingList.reduce((s, i) => s + i.needToBuy * i.unitCost, 0);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Person Count Inputs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Users className="h-5 w-5" />
            Personas por Porcion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            {SIZE_SEGMENTS.map((segment) => {
              const key = segment.name === "Pequeña" ? "pequena" : segment.name === "Mediana" ? "mediana" : "grande";
              return (
                <div key={segment.name} className="flex items-center gap-2 rounded-lg border bg-card p-3">
                  <UserRound className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-medium">{segment.name}</label>
                  <Input
                    type="number" min="0"
                    value={personCounts[key]}
                    onChange={(e) => handlePersonCountChange(key, e.target.value)}
                    className="h-8 w-20 text-center font-semibold"
                  />
                </div>
              );
            })}
            <Badge variant="outline" className="h-10 px-4 text-base">
              Total: {totalPersons} personas
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Palette */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-secondary">
            <ChefHat className="h-5 w-5" />
            Ingredientes Disponibles
            <span className="text-sm font-normal text-muted-foreground ml-2">
              (Arrastra al calendario)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Proteins */}
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1">
              <Beef className="h-3 w-3" /> Proteínas
            </p>
            <div className="flex flex-wrap gap-2">
              {PROTEIN_NAMES.map((name) => (
                <div
                  key={name}
                  draggable
                  onDragStart={(e) => onDragStart(e, { kind: "protein", value: name })}
                  className={cn(
                    "flex cursor-grab items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all active:cursor-grabbing",
                    PROTEIN_COLORS[name] ?? "bg-muted border-muted-foreground/30"
                  )}
                >
                  <GripVertical className="h-3 w-3 opacity-50" />
                  {name}
                </div>
              ))}
            </div>
          </div>

          {/* Garnishes */}
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1">
              <Utensils className="h-3 w-3" /> Guarniciones
            </p>
            <div className="flex flex-wrap gap-2">
              {RECIPES.map((recipe) => (
                <div
                  key={recipe.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, { kind: "garnish", value: recipe })}
                  className="flex cursor-grab items-center gap-1.5 rounded-lg border bg-green-50 border-green-400 text-green-800 px-3 py-1.5 text-sm font-medium transition-all hover:bg-green-100 active:cursor-grabbing"
                >
                  <GripVertical className="h-3 w-3 opacity-50" />
                  {recipe.name}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Cost Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Costo Semanal Total</p>
                <p className="text-2xl font-bold text-primary">${totalCost.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Comidas Planificadas</p>
                <p className="text-xl font-semibold">{mealCount} / 21</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Costo por Persona</p>
                <p className="text-xl font-semibold">${costPerPerson.toFixed(2)}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleClearAll} className="ml-auto">
              Limpiar Todo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Calendar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Calendar className="h-5 w-5" />
            Menu Semanal
            <span className="text-sm font-normal text-muted-foreground ml-2">
              (3 comidas x 7 dias = 21 comidas)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              {/* Header Row */}
              <div className="grid grid-cols-8 gap-2 mb-3">
                <div />
                {DAYS.map((day) => (
                  <div key={day} className="rounded-lg bg-muted/50 p-2 text-center font-semibold text-sm">
                    {day}
                  </div>
                ))}
              </div>

              {/* Meal Rows */}
              {MEALS.map((meal, mealIndex) => (
                <div key={meal} className="grid grid-cols-8 gap-2 mb-2">
                  <div className="flex items-center justify-center rounded-lg bg-secondary/10 p-2 font-medium text-secondary text-sm">
                    <Utensils className="h-4 w-4 mr-1.5" />
                    {meal}
                  </div>
                  {DAYS.map((_, dayIndex) => {
                    const slot = weeklyMenu[dayIndex][mealIndex];
                    const isDropTarget = dragOverSlot?.day === dayIndex && dragOverSlot?.meal === mealIndex;
                    const cost = slotCost(slot, products, personCounts);

                    return (
                      <div
                        key={`${dayIndex}-${mealIndex}`}
                        onDragOver={(e) => onDragOver(e, dayIndex, mealIndex)}
                        onDragLeave={onDragLeave}
                        onDrop={(e) => onDrop(e, dayIndex, mealIndex)}
                        className={cn(
                          "min-h-27.5 rounded-lg border-2 border-dashed p-2 transition-all flex flex-col gap-1",
                          isDropTarget
                            ? "border-secondary bg-secondary/10"
                            : slot.protein || slot.garnish
                            ? "border-solid border-muted bg-card"
                            : "border-muted/50 bg-muted/10 hover:border-muted"
                        )}
                      >
                        {/* Protein slot */}
                        {slot.protein ? (
                          <div className={cn(
                            "flex items-center justify-between rounded border px-1.5 py-1 text-xs font-medium",
                            PROTEIN_COLORS[slot.protein] ?? "bg-muted border-muted-foreground/30"
                          )}>
                            <span className="truncate">{slot.protein}</span>
                            <button
                              onClick={() => removeProtein(dayIndex, mealIndex)}
                              className="ml-1 shrink-0 rounded hover:text-destructive"
                            >
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="rounded border border-dashed border-muted/60 px-1.5 py-1 text-center text-[10px] text-muted-foreground">
                            + proteína
                          </div>
                        )}

                        {/* Divider */}
                        <div className="border-t border-dashed border-muted/40" />

                        {/* Garnish slot */}
                        {slot.garnish ? (
                          <div className="flex items-center justify-between rounded border border-green-400 bg-green-50 px-1.5 py-1 text-xs font-medium text-green-800">
                            <span className="truncate">{slot.garnish.name}</span>
                            <button
                              onClick={() => removeGarnish(dayIndex, mealIndex)}
                              className="ml-1 shrink-0 rounded hover:text-destructive"
                            >
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="rounded border border-dashed border-muted/60 px-1.5 py-1 text-center text-[10px] text-muted-foreground">
                            + guarnición
                          </div>
                        )}

                        {/* Cost badge */}
                        {cost > 0 && totalPersons > 0 && (
                          <Badge variant="secondary" className="text-[10px] mt-auto self-end">
                            ${cost.toFixed(0)}
                          </Badge>
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

      {/* Daily Cost Breakdown */}
      {mealCount > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-primary">
              <DollarSign className="h-5 w-5" />
              Desglose de Costos por Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {DAYS.map((day, dayIndex) => {
                const dayCost = weeklyMenu[dayIndex].reduce(
                  (sum, slot) => sum + slotCost(slot, products, personCounts), 0
                );
                const dayMealCount = weeklyMenu[dayIndex].filter(
                  (s) => s.protein || s.garnish
                ).length;

                return (
                  <div
                    key={day}
                    className={cn(
                      "rounded-lg border p-3 text-center",
                      dayMealCount === 3 ? "border-green-200 bg-green-50" : "border-muted"
                    )}
                  >
                    <p className="text-sm font-medium">{day}</p>
                    <p className="text-lg font-bold text-primary">${dayCost.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">{dayMealCount}/3 comidas</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shopping List */}
      {shoppingList.length > 0 && (
        <Card className="border-secondary/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-secondary">
                <ShoppingCart className="h-5 w-5" />
                Lista de Compras Semanal
              </CardTitle>
              <Badge variant="secondary" className="text-lg px-4 py-1">
                Total a Comprar: ${totalShoppingCost.toFixed(2)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Ingrediente</TableHead>
                    <TableHead className="text-right font-semibold">Gramos Necesarios</TableHead>
                    <TableHead className="text-right font-semibold">Unidades Totales</TableHead>
                    <TableHead className="text-right font-semibold">En Inventario (g)</TableHead>
                    <TableHead className="text-right font-semibold">Unidades a Comprar</TableHead>
                    <TableHead className="text-right font-semibold">Costo Unitario</TableHead>
                    <TableHead className="text-right font-semibold">Costo Total</TableHead>
                    <TableHead className="text-center font-semibold">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shoppingList.map((item, index) => {
                    const hasEnough = item.inventoryAvailable >= item.totalGrams;
                    return (
                      <TableRow
                        key={item.name}
                        className={cn(
                          index % 2 === 0 ? "bg-card" : "bg-muted/20",
                          item.needToBuy > 0 && "bg-orange-50"
                        )}
                      >
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-right">{item.totalGrams.toLocaleString(undefined, { maximumFractionDigits: 0 })} g</TableCell>
                        <TableCell className="text-right">{item.unitsNeeded}</TableCell>
                        <TableCell className="text-right">{item.inventoryAvailable.toLocaleString()} g</TableCell>
                        <TableCell className="text-right">
                          {item.needToBuy > 0 ? (
                            <span className="font-bold text-secondary">{item.needToBuy}</span>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">${item.unitCost.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-semibold">
                          ${(item.needToBuy * item.unitCost).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          {hasEnough ? (
                            <Badge variant="outline" className="border-green-500 text-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Suficiente
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-orange-500 text-orange-600">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Comprar
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-sm">Con inventario suficiente: {shoppingList.filter(i => i.inventoryAvailable >= i.totalGrams).length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-orange-500" />
                <span className="text-sm">A comprar: {shoppingList.filter(i => i.needToBuy > 0).length}</span>
              </div>
              <div className="ml-auto flex items-center gap-2 font-semibold">
                <ShoppingCart className="h-4 w-4 text-secondary" />
                <span>Costo estimado: ${totalShoppingCost.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
