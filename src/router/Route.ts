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
        let route = this.route;
        const urlParams = this.params.url;
        const urlParamTokens = route.match(/:[\w]+/g) || [];
        urlParamTokens.forEach(token => {
            const name = token.replace(':', '');
            const val = urlParams[name];
            route = route.replace(token, val);
        });
        return route;
    }

    applyParams(params: IParams): void {
        const newParams = {
            url: params.url || {},
            query: params.query || {}
        };
        this._params = newParams;
    }
}

export interface IViewState {
    path: string;
    params: IParams;
    view: Route;
}
