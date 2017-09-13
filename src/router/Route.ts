import * as path from 'path';
import {action, computed, observable} from "mobx";
import {invariant, isNullOrUndefined, identity} from "../utils/utils";
import {IPathParams, IQueryParams} from './IParams';
import {replacePathParams, urlEncodeQueryParams} from '../utils/utils';

export type ILifecycleCallback = (state: IViewState, store?: any) => boolean | void;
export type INonblockingLifecycleCallback = (state: IViewState, store?: any) => void;

export interface IRouteConfig {
    acceptedQueryParams?: string[];
    children?: Route[];
    component: React.ComponentType<any>;
    name: string;
    path: string;
    beforeEnter?: ILifecycleCallback;
    onEnter?: INonblockingLifecycleCallback;
    beforeExit?: ILifecycleCallback;
}

export interface IRoute {
    acceptedQueryParams: string[]; // list of accepted query params, anything else will be ignored
    children: Route[];
    component: React.ComponentType<any>;
    fullPath: string; // path with path params replaced, includes any parent paths
    fullPathDefinition: string; // path with path param names as placeholders, includes all parent routes
    getLifecycleCallbackList: (lifecycleName: string) => ILifecycleCallback[]; // a list of callbacks with the top-most route's callback at index 0
    name: string; // unique name
    params: IPathParams;
    parentRoute: Route;
    path: string; // path with path params replaced, does not include parent. always starts with a '/'
    pathAndQuery: string; // string with the path and query params concatenated
    pathDefinition: string; // path with path param names as placeholders, does not include parent routes
    queryParams: IQueryParams;
    viewState: IViewState;
    beforeEnter: (state: IViewState, store?: any) => boolean | void;
    beforeExit: (state: IViewState, store?: any) => boolean | void;
    onEnter: (state: IViewState, store?: any) => boolean | void;
}

export class Route implements IRoute {
    acceptedQueryParams: string[];
    children: Route[];
    component: React.ComponentType<any>;
    name: string;
    parentRoute: Route;
    pathDefinition: string;
    beforeEnter: (state: IViewState, store?: any) => boolean | void;
    onEnter: (state: IViewState, store?: any) => void;
    beforeExit: (state: IViewState, store?: any) => boolean | void;
    @observable private _params: IPathParams;
    @observable private _queryParams: IQueryParams;

    constructor(config: IRouteConfig) {
        invariant(isNullOrUndefined([config.component, config.name, config.path]), 'route config must have name, route, and component props.');
        this.acceptedQueryParams = config.acceptedQueryParams || [];
        this.children = [];
        this.component = config.component;
        this.pathDefinition = config.path;
        this.name = config.name;
        this._params = null;
        this.parentRoute = null;
        this.beforeEnter = config.beforeEnter || identity;
        this.onEnter = config.onEnter || identity;
        this.beforeExit = config.beforeExit || identity;
        this._queryParams = null;
        this._appendChildRoutes(config.children);
    }

    get fullPath(): string {
        return replacePathParams(this.fullPathDefinition, this.params);
    }

    get fullPathDefinition(): string {
        // need to recursively concatinate parent paths
        return this.parentRoute ? path.join(this.parentRoute.fullPathDefinition, this.pathDefinition) : this.pathDefinition;
    }

    @computed
    get params(): IPathParams {
        return this._params || {};
    }

    @computed
    get path(): string {
        // need to recursively concatinate parent paths
        return replacePathParams(this.pathDefinition, this.params);
    }

    @computed
    get pathAndQuery(): string {
        return this.fullPath + urlEncodeQueryParams(this.queryParams);
    }

    @computed
    get queryParams(): IQueryParams {
        return this._queryParams || {};
    }

    @computed
    get viewState(): IViewState {
        return {
            path: this.path,
            params: this.params,
            query: this.queryParams,
            view: this
        }
    }

    getLifecycleCallbackList(lifecycleName: string): ILifecycleCallback[] {
        const callbacks = [];
        let route: IRoute = this;
        while (route !== null) {
            callbacks.unshift(route[lifecycleName]);
            route = route.parentRoute;
        }
        return callbacks;
    }

    @action
    updateParams(params?: IPathParams, query?: IQueryParams): void {
        if (!isNullOrUndefined(params)) {
            this._params = params;
        }
        if (!isNullOrUndefined(query)) {
            this._queryParams = query;
        }
    }

    private _appendChildRoutes(children?: Route[]) {
        if (isNullOrUndefined(children)) return;
        children.forEach(this._addChildRoute.bind(this));
    }

    private _addChildRoute(route: Route): void {
        this.children.push(route);
        route.parentRoute = this;
    }
}

export interface IViewState {
    path: string;
    params: IPathParams;
    query: IQueryParams;
    view: Route;
}
