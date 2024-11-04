"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";
import { ModeToggle } from "./theme-toggle";

interface NutritionValues {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface StoredSettings {
  savedNumDays: number;
  savedTargets: NutritionValues;
  savedErrors: NutritionValues;
}

const STORAGE_KEY = "nutrition-generator-settings";

const defaultTargets: NutritionValues = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 65,
};

const defaultErrors: NutritionValues = {
  calories: 100,
  protein: 10,
  carbs: 20,
  fat: 5,
};

const NutritionTableGenerator = () => {
  const [numDays, setNumDays] = useState<number>(7);
  const [targets, setTargets] = useState<NutritionValues>(defaultTargets);
  const [errors, setErrors] = useState<NutritionValues>(defaultErrors);
  const [output, setOutput] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (savedSettings) {
      try {
        const { savedNumDays, savedTargets, savedErrors }: StoredSettings =
          JSON.parse(savedSettings);
        setNumDays(savedNumDays);
        setTargets(savedTargets);
        setErrors(savedErrors);
      } catch (error) {
        console.error("Error loading saved settings:", error);
        resetToDefaults();
      }
    }
  }, []);

  useEffect(() => {
    const settings: StoredSettings = {
      savedNumDays: numDays,
      savedTargets: targets,
      savedErrors: errors,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [numDays, targets, errors]);

  const generateValueWithError = (target: number, error: number): number => {
    const min = target - error;
    const max = target + error;
    return Math.round(min + Math.random() * (max - min));
  };

  const generateTable = (): void => {
    const result: NutritionValues[] = [];

    for (let i = 0; i < numDays; i++) {
      const row: NutritionValues = {
        calories: generateValueWithError(targets.calories, errors.calories),
        protein: generateValueWithError(targets.protein, errors.protein),
        carbs: generateValueWithError(targets.carbs, errors.carbs),
        fat: generateValueWithError(targets.fat, errors.fat),
      };
      result.push(row);
    }

    const formattedOutput = result
      .map((row) => `${row.calories}\t${row.protein}\t${row.carbs}\t${row.fat}`)
      .join("\n");

    setOutput(formattedOutput);
  };

  const handleInputChange = (
    category: "targets" | "errors",
    field: keyof NutritionValues,
    value: string
  ): void => {
    const numValue = parseFloat(value) || 0;
    if (category === "targets") {
      setTargets((prev) => ({ ...prev, [field]: numValue }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: numValue }));
    }
  };

  const resetToDefaults = (): void => {
    setNumDays(7);
    setTargets(defaultTargets);
    setErrors(defaultErrors);
    setOutput("");
    localStorage.removeItem(STORAGE_KEY);
  };

  const copyToClipboard = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(output);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <Card className="w-full h-fit max-w-2xl mx-8 md:mx-auto my-auto">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Nutrition Table Generator</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={resetToDefaults}
              className="text-sm"
            >
              Reset to Defaults
            </Button>
            <ModeToggle />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Number of Days</Label>
          <Input
            type="number"
            value={numDays}
            onChange={(e) => setNumDays(parseInt(e.target.value) || 0)}
            min="1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <h3 className="font-semibold">Target Values</h3>
            {Object.entries(targets).map(([field, value]) => (
              <div key={field} className="space-y-1">
                <Label className="capitalize">{field}</Label>
                <Input
                  type="number"
                  value={value}
                  onChange={(e) =>
                    handleInputChange(
                      "targets",
                      field as keyof NutritionValues,
                      e.target.value
                    )
                  }
                  min="0"
                />
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Error Margins (±)</h3>
            {Object.entries(errors).map(([field, value]) => (
              <div key={field} className="space-y-1">
                <Label className="capitalize">{field}</Label>
                <Input
                  type="number"
                  value={value}
                  onChange={(e) =>
                    handleInputChange(
                      "errors",
                      field as keyof NutritionValues,
                      e.target.value
                    )
                  }
                  min="0"
                />
              </div>
            ))}
          </div>
        </div>

        <Button onClick={generateTable} className="w-full">
          Generate Table
        </Button>

        {output && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Generated Table</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="flex gap-2 items-center"
              >
                {isCopied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
            </div>
            <textarea
              className="w-full h-48 p-2 font-mono text-sm border rounded bg-background"
              value={output}
              readOnly
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NutritionTableGenerator;
