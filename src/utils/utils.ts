import { IPathParams, IQueryParams } from '../interfaces';

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

export function isOr<T>(val: T, orVal: T): T {
    return val != null ? val : orVal;
}

export function buildPathParamsObject(path: string, values: string[]): IQueryParams {
    const urlParamTokens = path.match(/:[\w]+/g) || [];
    const pathParams = {};
    urlParamTokens.forEach((token, i) => {
        const name = token.replace(':', '');
        pathParams[name] = values[i];
    });
    return pathParams;
}

export function replacePathParams(path: string, params?: IPathParams): string {
    const urlParamTokens = path.match(/:[\w]+/g) || [];
    if (urlParamTokens.length === 0) return path;

    let replacedPath = path;
    urlParamTokens.forEach(token => {
        const name = token.replace(':', '');
        const val = params[name];
        invariant(isNullOrUndefined(val), `url params are required to build path for route ${path}`);
        replacedPath = replacedPath.replace(token, val);
    });

    return replacedPath;
}

export function urlEncodeQueryParams(queryParams: IQueryParams): string {
    if (queryParams == null || isEmptyObject(queryParams)) return '';

    const queryPairs = Object.keys(queryParams).map(name => {
        const val = queryParams[name];
        const encodedVal = encodeURIComponent(val.toString());
        return `${name}=${encodedVal}`;
    });

    return '?' + queryPairs.join('&');
}

export function isEmptyObject(val?: any): boolean {
    return isNullOrUndefined(val) || Object.keys(val).length === 0;
}
