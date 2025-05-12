import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function bigintToCurrency(n: bigint) {
    const abs_n = n < 0 ? -n : n;
    const SCALE_FACTOR = 100n;
    const whole = abs_n / SCALE_FACTOR;
    const decimal = abs_n % SCALE_FACTOR;
    const decimalString = decimal.toString().padStart(2, "0");
    if (n < 0) {
        return `(${whole}.${decimalString})`;
    } else {
        return `${whole}.${decimalString}`;
    }
}

export function numberToBigint(n: number): bigint {
    const SCALE_FACTOR = 100;
    const int = n * SCALE_FACTOR;
    return BigInt(int.toFixed(0));
}

export function bigintToNumber(n: bigint): number {
    const SCALE_FACTOR = 100;
    const int = Number(n);
    return int / SCALE_FACTOR;
}
