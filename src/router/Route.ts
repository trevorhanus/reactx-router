import {Component} from 'react';
import {invariant, isNullOrUndefined, identity} from "../utils/index";
import {IParams} from "./buildParams";
import {computed, observable} from "mobx";

export interface IRouteConfig {
    acceptedQueryParams?: string[]
    component: any;
    name: string;
    route: string;
    beforeEnter?: (state: IViewState) => boolean;
    onEnter?: (state: IViewState) => boolean;
    beforeExit?: (state: IViewState) => boolean;
    onExit?: (state: IViewState) => boolean;
}

export class Route {
    acceptedQueryParams: string[];
    route: string;
    name: string;
    component: Component;
    beforeEnter: (state: IViewState) => boolean;
    onEnter: (state: IViewState) => boolean;
    beforeExit: (state: IViewState) => boolean;
    onExit: (state: IViewState) => boolean;
    @observable private _params: IParams;

    constructor(config: IRouteConfig) {
        invariant(isNullOrUndefined([config.component, config.name, config.route]), 'route config must have name, route, and component props.');
        this.acceptedQueryParams = config.acceptedQueryParams || [];
        this.component = config.component;
        this.name = config.name;
        this.route = config.route;
        this.beforeEnter = config.beforeEnter || identity;
        this.onEnter = config.onEnter || identity;
        this.beforeExit = config.beforeExit || identity;
        this.onExit = config.onExit || identity;
        this._params = null;
    }

    @computed
    get params(): IParams {
        return this._params || {url: {}, query: {}};
    }

    @computed
    get viewState(): IViewState {
        return {
            path: this.path,
            params: this.params,
            view: this
        }
    }

    @computed
    get path(): string {
        return this.buildPath(this.params.url);
    }

    applyParams(params: IParams): void {
        const newParams = {
            url: params.url || {},
            query: params.query || {}
        };
        this._params = newParams;
    }

    buildUrl(params: IParams): string {
        params = params || {};
        const path = this.buildPath(params.url);
        const query = this.urlEncodeQueryParams(params.query);
        return `${path}?${query}`;
    }

    private buildPath(urlParams?: any): string {
        let path = this.route;
        const urlParamTokens = path.match(/:[\w]+/g) || [];
        if (urlParamTokens.length === 0) return path;

        urlParamTokens.forEach(token => {
            const name = token.replace(':', '');
            const val = urlParams[name];
            invariant(isNullOrUndefined(val), `url params are required to build path for route ${path}`);
            path = path.replace(token, val);
        });
        return path;
    }

    private urlEncodeQueryParams(queryParams?: any): string {
        if (isNullOrUndefined(queryParams)) return '';
        const queryPairs = Object.keys(queryParams).map(name => {
            const val = queryParams[name];
            return `${name}=${val}`;
        });
        return encodeURIComponent(queryPairs.join('&'));
    }
}

export interface IViewState {
    path: string;
    params: IParams;
    view: Route;
}
