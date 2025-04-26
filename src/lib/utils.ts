import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function bigintToCurrency(n: bigint) {
    const SCALE_FACTOR = 100n;
    const whole = n / SCALE_FACTOR;
    const decimal = n % SCALE_FACTOR;
    return `${whole}.${decimal}`;
}

export function numberToBigint(n: number): bigint {
    const SCALE_FACTOR = 100;
    const int = n * SCALE_FACTOR;
    return BigInt(int.toFixed(0));
}
