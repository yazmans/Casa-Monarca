"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ChefHat, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
export interface CustomRecipe {
  id: string;           // key used in Python model (no spaces)
  label: string;        // display name
  ingredient1: { product: string; fraction: number };
  ingredient2: { product: string; fraction: number };
  validMeals: string[]; // subset of ["Desayuno","Comida","Cena"]
}

const ALL_PRODUCTS = [
  "Arroz", "Calabacita", "Zanahoria", "Papa", "Atun", "Pollo", "Res",
  "Pasta", "Frijoles", "Jitomate", "Mojarra", "Huevo", "Jamon",
  "Avena", "Leche", "Bolillo",
];
const MEALS = ["Desayuno", "Comida", "Cena"];

const MEAL_COLORS: Record<string, string> = {
  Desayuno: "border-yellow-400 text-yellow-700 bg-yellow-50",
  Comida:   "border-green-400 text-green-700 bg-green-50",
  Cena:     "border-blue-400 text-blue-700 bg-blue-50",
};

// ── Component ──────────────────────────────────────────────────────────────
interface Props {
  recipes: CustomRecipe[];
  onChange: (updated: CustomRecipe[]) => void;
}

const emptyForm = (): Omit<CustomRecipe, "id"> & { id: string } => ({
  id: "",
  label: "",
  ingredient1: { product: "", fraction: 0.5 },
  ingredient2: { product: "", fraction: 0.5 },
  validMeals: [],
});

export function RecipeEditor({ recipes, onChange }: Props) {
  const [open, setOpen]   = useState(false);
  const [form, setForm]   = useState(emptyForm());
  const [error, setError] = useState<string | null>(null);

  const setF = <K extends keyof typeof form>(key: K, val: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const setIngredient = (n: 1 | 2, field: "product" | "fraction", val: string | number) =>
    setForm((f) => ({
      ...f,
      [`ingredient${n}`]: { ...f[`ingredient${n}`], [field]: val },
    }));

  const toggleMeal = (meal: string) =>
    setForm((f) => ({
      ...f,
      validMeals: f.validMeals.includes(meal)
        ? f.validMeals.filter((m) => m !== meal)
        : [...f.validMeals, meal],
    }));

  const handleAdd = () => {
    setError(null);
    if (!form.label.trim()) { setError("Escribe un nombre para la receta."); return; }
    if (!form.ingredient1.product || !form.ingredient2.product) { setError("Selecciona los 2 ingredientes."); return; }
    if (form.ingredient1.product === form.ingredient2.product) { setError("Los ingredientes deben ser distintos."); return; }
    if (form.validMeals.length === 0) { setError("Selecciona al menos una comida."); return; }
    const f1 = Number(form.ingredient1.fraction);
    const f2 = Number(form.ingredient2.fraction);
    if (f1 <= 0 || f2 <= 0) { setError("Las fracciones deben ser > 0."); return; }

    const id = form.label.replace(/\s+/g, "") + "_custom";
    if (recipes.some((r) => r.id === id)) { setError("Ya existe una receta con ese nombre."); return; }

    // Normalize fractions so they sum to 1
    const total = f1 + f2;
    const newRecipe: CustomRecipe = {
      id,
      label: form.label.trim(),
      ingredient1: { product: form.ingredient1.product, fraction: f1 / total },
      ingredient2: { product: form.ingredient2.product, fraction: f2 / total },
      validMeals: form.validMeals,
    };
    onChange([...recipes, newRecipe]);
    setForm(emptyForm());
  };

  const remove = (id: string) => onChange(recipes.filter((r) => r.id !== id));

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-primary">
            <ChefHat className="h-5 w-5" />
            Recetas / Guarniciones Extra
            {recipes.length > 0 && (
              <Badge variant="secondary">{recipes.length} añadida{recipes.length > 1 ? "s" : ""}</Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setOpen((o) => !o)} className="gap-1">
            {open ? <><ChevronUp className="h-4 w-4" /> Ocultar</> : <><ChevronDown className="h-4 w-4" /> Agregar</>}
          </Button>
        </div>
      </CardHeader>

      {open && (
        <CardContent className="space-y-4">
          {/* Form */}
          <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
            <p className="text-sm font-semibold text-muted-foreground">Nueva receta de guarnición</p>

            {/* Name */}
            <div className="flex flex-col gap-1">
              <Label className="text-xs">Nombre de la receta</Label>
              <Input
                placeholder="Ej: Arroz con Elote"
                value={form.label}
                onChange={(e) => setF("label", e.target.value)}
                className="h-8 max-w-xs"
              />
            </div>

            {/* Ingredients */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {([1, 2] as const).map((n) => {
                const ing = form[`ingredient${n}`];
                return (
                  <div key={n} className="space-y-1">
                    <Label className="text-xs">Ingrediente {n}</Label>
                    <div className="flex gap-2">
                      <Select
                        value={ing.product}
                        onValueChange={(v) => setIngredient(n, "product", v)}
                      >
                        <SelectTrigger className="h-8 flex-1">
                          <SelectValue placeholder="Seleccionar…" />
                        </SelectTrigger>
                        <SelectContent>
                          {ALL_PRODUCTS.map((p) => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number" min="0.01" max="1" step="0.05"
                        value={ing.fraction}
                        onChange={(e) => setIngredient(n, "fraction", parseFloat(e.target.value) || 0)}
                        className="h-8 w-20 text-center text-xs"
                        title="Fracción de peso (se normalizará automáticamente)"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Valid meals */}
            <div>
              <Label className="text-xs mb-2 block">Válida para</Label>
              <div className="flex gap-4">
                {MEALS.map((meal) => (
                  <div key={meal} className="flex items-center gap-1.5">
                    <Checkbox
                      id={`meal-${meal}`}
                      checked={form.validMeals.includes(meal)}
                      onCheckedChange={() => toggleMeal(meal)}
                    />
                    <label htmlFor={`meal-${meal}`} className="text-sm cursor-pointer">{meal}</label>
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <Button size="sm" className="gap-1" onClick={handleAdd}>
              <Plus className="h-3.5 w-3.5" /> Agregar Receta
            </Button>
          </div>

          {/* Existing custom recipes */}
          {recipes.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recetas agregadas</p>
              {recipes.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg border bg-card px-3 py-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-medium text-sm">{r.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {r.ingredient1.product} ({(r.ingredient1.fraction * 100).toFixed(0)}%) +{" "}
                      {r.ingredient2.product} ({(r.ingredient2.fraction * 100).toFixed(0)}%)
                    </span>
                    <div className="flex gap-1">
                      {r.validMeals.map((m) => (
                        <Badge key={m} variant="outline" className={`text-[10px] px-1.5 ${MEAL_COLORS[m]}`}>{m}</Badge>
                      ))}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => remove(r.id)}
                    className="text-destructive hover:text-destructive shrink-0">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
