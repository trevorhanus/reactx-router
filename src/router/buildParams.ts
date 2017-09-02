import {zipObject, pick} from 'lodash';

export interface IParams {
    url?: {[paramId: string]: string};
    query?: {[paramId: string]: string};
}

export function buildParams(route: string, acceptedQueryParams: string[], urlParamsValues?: string[], queryParamsObject?: {[name: string]: string}): IParams {
    urlParamsValues = urlParamsValues || [];
    queryParamsObject = queryParamsObject || {};

    const urlParamsNames = (route.match(/:[\w]+/g) || []).map(token => token.replace(':', ''));
    const urlParams = zipObject(urlParamsNames, urlParamsValues);
    const queryParams = pick(queryParamsObject, acceptedQueryParams);

    return {
        url: urlParams,
        query: queryParams
    }
}
