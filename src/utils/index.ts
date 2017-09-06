export function invariant(check: boolean, message): void {
    if (check) {
        throw new Error(`[reactx-ui] ${message}`);
    }
}

export function isNullOrUndefined(val: any | any[]) {
    if (Array.isArray(val)) {
        return !val.every(v => {
            return v !== null && v !== undefined;
        });
    } else {
        return val === null || val === undefined;
    }
}

export function identity(): boolean { return true; }

export function warn(message: string): void {
    console.warn(`[reactx] Warning: ${message}`);
}
