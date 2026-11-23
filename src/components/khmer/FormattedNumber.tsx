"use client";

import type { ComponentPropsWithoutRef } from "react";
import { formatNumber, type FormatNumberOptions, type NumeralSystem } from "@/lib/khmer/numerals";
import { useNumeralPreference } from "./NumeralPreferenceProvider";

export interface FormattedNumberProps extends Omit<ComponentPropsWithoutRef<"span">, "children"> {
  value: number;
  numeralSystem?: NumeralSystem;
  formatOptions?: Omit<FormatNumberOptions, "numeralSystem">;
}

export function FormattedNumber({
  value,
  numeralSystem,
  formatOptions,
  ...rest
}: FormattedNumberProps) {
  const { numeralSystem: preferredSystem } = useNumeralPreference();
  const activeSystem = numeralSystem ?? preferredSystem;

  return (
    <span {...rest}>
      {formatNumber(value, {
        ...formatOptions,
        numeralSystem: activeSystem,
      })}
    </span>
  );
}
