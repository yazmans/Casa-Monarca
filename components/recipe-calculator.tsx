"use client";

import { useState } from "react";
import {
  Recipe,
  Product,
  RECIPES,
  calculateRecipeNeedsCustom,
  SIZE_SEGMENTS,
  PersonCounts,
} from "@/lib/inventory-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calculator, Users, ChefHat, DollarSign, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecipeCalculatorProps {
  products: Product[];
}

export function RecipeCalculator({ products }: RecipeCalculatorProps) {
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("");
  const [personCounts, setPersonCounts] = useState<PersonCounts>({
    pequena: 12,
    mediana: 61,
    grande: 7,
  });

  const selectedRecipe = RECIPES.find((r) => r.id === selectedRecipeId);
  const recipeNeeds = selectedRecipe
    ? calculateRecipeNeedsCustom(selectedRecipe, products, personCounts)
    : null;

  const totalPersons = personCounts.pequena + personCounts.mediana + personCounts.grande;

  const handlePersonCountChange = (size: keyof PersonCounts, value: string) => {
    const numValue = parseInt(value) || 0;
    setPersonCounts((prev) => ({ ...prev, [size]: Math.max(0, numValue) }));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Calculator className="h-5 w-5" />
          Calculadora de Recetas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Person Count Inputs */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-secondary" />
            <span className="font-medium">Personas por Porcion</span>
            <Badge variant="outline" className="ml-auto">
              Total: {totalPersons} personas
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {SIZE_SEGMENTS.map((segment) => {
              const key = segment.name === "Pequeña" ? "pequena" : segment.name === "Mediana" ? "mediana" : "grande";
              return (
                <div
                  key={segment.name}
                  className="space-y-2 rounded-lg border bg-card p-3"
                >
                  <div className="flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-muted-foreground" />
                    <label className="text-sm font-medium">{segment.name}</label>
                  </div>
                  <Input
                    type="number"
                    min="0"
                    value={personCounts[key]}
                    onChange={(e) => handlePersonCountChange(key, e.target.value)}
                    className="h-10 text-center font-semibold"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    {segment.proteinGrams}g prot / {segment.garnishGrams}g guar
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recipe Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Seleccionar Receta</label>
          <Select value={selectedRecipeId} onValueChange={setSelectedRecipeId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Elige una receta..." />
            </SelectTrigger>
            <SelectContent>
              {RECIPES.map((recipe) => (
                <SelectItem key={recipe.id} value={recipe.id}>
                  <div className="flex items-center gap-2">
                    <ChefHat className="h-4 w-4" />
                    {recipe.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Recipe Details */}
        {selectedRecipe && recipeNeeds && totalPersons > 0 && (
          <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-secondary" />
                <h4 className="font-semibold">{selectedRecipe.name}</h4>
              </div>
              <Badge className="bg-secondary">
                {recipeNeeds.totalPersons} personas
              </Badge>
            </div>

            <div className="text-sm text-muted-foreground">
              Total de gramos necesarios:{" "}
              <span className="font-semibold text-foreground">
                {recipeNeeds.totalGramsNeeded.toLocaleString()} g
              </span>
            </div>

            {/* Ingredient 1 */}
            <div className="space-y-2 rounded-lg bg-card p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{recipeNeeds.ingredient1.name}</span>
                <Badge variant="secondary">
                  {selectedRecipe.ingredient1.percentage}%
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Gramos necesarios</p>
                  <p className="font-semibold">
                    {recipeNeeds.ingredient1.gramsNeeded.toLocaleString()} g
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Unidades necesarias</p>
                  <p className="font-semibold">
                    {recipeNeeds.ingredient1.unitsNeeded}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Disponible</p>
                  <p
                    className={cn(
                      "font-semibold",
                      recipeNeeds.ingredient1.available >=
                        recipeNeeds.ingredient1.gramsNeeded
                        ? "text-green-600"
                        : "text-destructive"
                    )}
                  >
                    {recipeNeeds.ingredient1.available.toLocaleString()} g
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Costo</p>
                  <p className="font-semibold">
                    ${recipeNeeds.ingredient1.cost.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Ingredient 2 */}
            <div className="space-y-2 rounded-lg bg-card p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{recipeNeeds.ingredient2.name}</span>
                <Badge variant="secondary">
                  {selectedRecipe.ingredient2.percentage}%
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Gramos necesarios</p>
                  <p className="font-semibold">
                    {recipeNeeds.ingredient2.gramsNeeded.toLocaleString()} g
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Unidades necesarias</p>
                  <p className="font-semibold">
                    {recipeNeeds.ingredient2.unitsNeeded}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Disponible</p>
                  <p
                    className={cn(
                      "font-semibold",
                      recipeNeeds.ingredient2.available >=
                        recipeNeeds.ingredient2.gramsNeeded
                        ? "text-green-600"
                        : "text-destructive"
                    )}
                  >
                    {recipeNeeds.ingredient2.available.toLocaleString()} g
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Costo</p>
                  <p className="font-semibold">
                    ${recipeNeeds.ingredient2.cost.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Cost */}
            <div className="flex items-center justify-between rounded-lg bg-primary p-3 text-primary-foreground">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                <span className="font-medium">Costo Total del Menu</span>
              </div>
              <span className="text-xl font-bold">
                ${recipeNeeds.totalCost.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {totalPersons === 0 && (
          <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
            Ingresa la cantidad de personas para calcular
          </div>
        )}
      </CardContent>
    </Card>
  );
}
