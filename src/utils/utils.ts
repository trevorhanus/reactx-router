import {IPathParams, IQueryParams} from '../router/IParams';

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

    urlParamTokens.forEach(token => {
        const name = token.replace(':', '');
        const val = params[name];
        invariant(isNullOrUndefined(val), `url params are required to build path for route ${path}`);
        path = path.replace(token, val);
    });

    return path;
}

export function urlEncodeQueryParams(queryParams: IQueryParams): string {
    if (isNullOrUndefined(queryParams) || isEmptyObject(queryParams)) return '';

    const queryPairs = Object.keys(queryParams).map(name => {
        const val = queryParams[name];
        return `${name}=${val}`;
    });

    return '?' + encodeURIComponent(queryPairs.join('&'));
}

export function isEmptyObject(val?: any): boolean {
    return isNullOrUndefined(val) || Object.keys(val).length === 0;
}
