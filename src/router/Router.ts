import * as queryString from 'query-string';
import {autorun, observable, computed, action} from 'mobx';
import {invariant, identity, isNullOrUndefined, buildPathParamsObject} from '../utils/utils';
import {IPathParams, IQueryParams} from './IParams';
import {Route, IViewState} from './Route';
import {Router as Director} from 'director/build/director';

export interface IRouter {
    currentParams: IPathParams;
    currentPath: string;
    currentViewState: IViewState;
    goTo: (name: string, params?: IPathParams, query?: IQueryParams) => void;
    hasRoute: (name: string) => boolean;
}

export class Router implements IRouter {
    private _routes: Map<string, Route>;
    private _store: any;
    @observable.ref private _currentRoute: Route;

    constructor() {
        this._routes = new Map<string, Route>();
        this._currentRoute = null;
    }

    @computed
    get currentParams(): IPathParams {
        return this._currentRoute !== null ? this._currentRoute.params : null;
    }

    @computed
    get currentPath(): string {
        return this._currentRoute !== null ? this._currentRoute.fullPath : null;
    }

    @computed
    get currentRoute(): Route {
        return this._currentRoute;
    }

    @computed
    get currentViewState(): IViewState {
        return this._currentRoute !== null ? this._currentRoute.viewState : null;
    }

    get(name: string): Route {
        return this._routes.get(name);
    }

    @action
    goTo(name: string, params?: IPathParams, query?: IQueryParams) {
        const currentRoute = this._currentRoute;
        const currentViewState = currentRoute ? currentRoute.viewState : null;

        const beforeExit = currentRoute && currentRoute.beforeExit || identity;
        const beforeExitResult = beforeExit(currentViewState, this._store);
        if (beforeExitResult === false) {
            return;
        }

        let newRoute = this._routes.get(name);
        if (isNullOrUndefined(newRoute)) {
            // need to display the 404 component
            // for now we will just throw
            throw new Error('could not find route');
        }
        newRoute.updateParams(params, query);
        const newViewState = newRoute.viewState;

        const beforeEnter = newRoute.beforeEnter;
        const beforeEnterResult = beforeEnter(newViewState, this._store);
        if (beforeEnterResult === false) {
            return;
        }

        const onEnter = newRoute.onEnter || identity;
        onEnter(newViewState, this._store);

        this._currentRoute = newRoute;
    }

    hasRoute(name: string): boolean {
        return this._routes.has(name);
    }

    @action
    public start(routes: Route[], store?: any): void {
        this._store = store || null;
        invariant(isNullOrUndefined(routes), 'start requires at least one route');
        
        // need to traverse the entire tree and ensure pathDefintions and names are unique
        const pathDefinitions: {[pathDefinition: string]: string} = {};
        this._traverseRouteTree(routes, (route) => {
            invariant(this._routes.has(route.name), `Two or more routes are named ${route.name}`);
            invariant(!isNullOrUndefined(pathDefinitions[route.fullPathDefinition]), `Two or more routes have the same path: ${pathDefinitions[route.fullPathDefinition]} and ${route.name}`);
            this._routes.set(route.name, route);
        });

        this._setupCurrentPathObserver();
        this._startRouter();
    }

    @action
    private _handleDirectorCallback(viewName: string, fullPathDefinition: string, ...urlParamsArray: string[]): void {
        const params = buildPathParamsObject(fullPathDefinition, urlParamsArray);
        const queryParamsObject = queryString.parse(window.location.search);
        this.goTo(viewName, params, queryParamsObject);
    }

    @action
    private _handleNotFound() {

    }

    private _startRouter() {
        const routes = {};
        this._routes.forEach(route => {
            routes[route.fullPathDefinition] = this._handleDirectorCallback.bind(this, route.name, route.fullPathDefinition);
        });

        const director = new Director(routes);
        director.configure({
            notfound: this._handleNotFound.bind(this),
            html5history: true
        });
        director.init();
    }

    private _setupCurrentPathObserver(): void {
        autorun(() => {
            const pathAndQuery = this.currentRoute.pathAndQuery;
            if (pathAndQuery !== null && pathAndQuery !== window.location.pathname + window.location.search) {
                window.history.pushState(null, null, pathAndQuery);
            }
        });
    }

    private _traverseRouteTree(routes: Route[], iterator: (route: Route) => void): void {
        routes.forEach(route => {
            iterator(route);
            if (!isNullOrUndefined(route.children)) {
                this._traverseRouteTree(route.children, iterator);
            }
        });
    }
}

// create a singleton to export
const router = new Router();

export {
    router
}

function handleLifeCycleCallback(callback: (viewState: IViewState) => any, viewState: IViewState): Promise<boolean> {
    const result = callback(viewState);
    if (result || result === null || result === undefined) {
        return Promise.resolve(true);
    }
    if (result instanceof Promise) {
        return result;
    }
    throw new Error('break_goto');
}
