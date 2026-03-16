"use client";

import { RECIPES } from "@/lib/inventory-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat } from "lucide-react";

export function RecipesTable() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary">
          <ChefHat className="h-5 w-5" />
          Recetas Disponibles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Receta</TableHead>
                <TableHead className="font-semibold">Ingrediente 1</TableHead>
                <TableHead className="font-semibold">Ingrediente 2</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RECIPES.map((recipe, index) => (
                <TableRow
                  key={recipe.id}
                  className={index % 2 === 0 ? "bg-card" : "bg-muted/20"}
                >
                  <TableCell className="font-medium">{recipe.name}</TableCell>
                  <TableCell>
                    {recipe.ingredient1.percentage}% {recipe.ingredient1.name}
                  </TableCell>
                  <TableCell>
                    {recipe.ingredient2.percentage}% {recipe.ingredient2.name}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
