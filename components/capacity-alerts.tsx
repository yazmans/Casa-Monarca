"use client";

import { Product, calculateStorageUsage, STORAGE_CAPACITY } from "@/lib/inventory-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Thermometer, Snowflake, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface CapacityAlertsProps {
  products: Product[];
}

export function CapacityAlerts({ products }: CapacityAlertsProps) {
  const storage = calculateStorageUsage(products);

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return "text-destructive";
    if (percentage >= 70) return "text-secondary";
    return "text-primary";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-destructive";
    if (percentage >= 70) return "bg-secondary";
    return "bg-primary";
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary">
          <AlertTriangle className="h-5 w-5" />
          Alertas de Capacidad
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ambiente */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium">Ambiente</span>
            </div>
            <span className={cn("text-sm font-semibold", getStatusColor(storage.ambiente.percentage))}>
              {storage.ambiente.used.toFixed(1)} / {storage.ambiente.capacity.toLocaleString()} L
            </span>
          </div>
          <div className="relative">
            <Progress value={Math.min(storage.ambiente.percentage, 100)} className="h-2" />
            <div
              className={cn(
                "absolute top-0 left-0 h-full rounded-full transition-all",
                getProgressColor(storage.ambiente.percentage)
              )}
              style={{ width: `${Math.min(storage.ambiente.percentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Capacidad máxima: {STORAGE_CAPACITY.ambiente.toLocaleString()} L
          </p>
        </div>

        {/* Refrigerador */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Refrigerador</span>
            </div>
            <span className={cn("text-sm font-semibold", getStatusColor(storage.refrigerador.percentage))}>
              {storage.refrigerador.used.toFixed(1)} / {storage.refrigerador.capacity.toLocaleString()} L
            </span>
          </div>
          <div className="relative">
            <Progress value={Math.min(storage.refrigerador.percentage, 100)} className="h-2" />
            <div
              className={cn(
                "absolute top-0 left-0 h-full rounded-full transition-all",
                getProgressColor(storage.refrigerador.percentage)
              )}
              style={{ width: `${Math.min(storage.refrigerador.percentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Capacidad máxima: {STORAGE_CAPACITY.refrigerador.toLocaleString()} L
          </p>
        </div>

        {/* Congelador */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Snowflake className="h-4 w-4 text-cyan-500" />
              <span className="text-sm font-medium">Congelador</span>
            </div>
            <span className={cn("text-sm font-semibold", getStatusColor(storage.congelador.percentage))}>
              {storage.congelador.used.toFixed(1)} / {storage.congelador.capacity.toLocaleString()} L
            </span>
          </div>
          <div className="relative">
            <Progress value={Math.min(storage.congelador.percentage, 100)} className="h-2" />
            <div
              className={cn(
                "absolute top-0 left-0 h-full rounded-full transition-all",
                getProgressColor(storage.congelador.percentage)
              )}
              style={{ width: `${Math.min(storage.congelador.percentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Capacidad máxima: {STORAGE_CAPACITY.congelador.toLocaleString()} L
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
