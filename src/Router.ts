import {Router as Director } from 'director/build/director';
import { action, autorun, computed, observable } from 'mobx';
import * as queryString from 'query-string';
import { Default404View } from './components/Default404';
import { IPathParams, IQueryParams } from './IParams';
import { ILifecycleCallback, IRoute, IViewState, Route } from './Route';
import { buildPathParamsObject, invariant, isNullOrUndefined } from './utils/utils';

export interface IRouter {
    currentParams: IPathParams;
    currentPath: string;
    currentViewState: IViewState;
    goTo(name: string, params?: IPathParams, query?: IQueryParams): void;
    hasRoute(name: string): boolean;
}

export class Router implements IRouter {
    private _notFoundComponent: React.ComponentType<any>;
    private _routes: Map<string, Route>;
    private _store: any;
    @observable.ref private _currentRoute: IRoute;

    constructor() {
        this._notFoundComponent = Default404View;
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
    get currentRoute(): IRoute {
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

        const beforeExitResult = !isNullOrUndefined(currentRoute)
            ? currentRoute.getLifecycleCallbackList('beforeExit').every(cb => {
                const result = cb(currentViewState, this._store);
                return result !== false;
            })
            : true;
        if (beforeExitResult === false) {
            return;
        }

        const newRoute = this._routes.get(name);

        // not finding the route is an invariant, since the developer would
        // have called goTo('name') and failed to have set up the route with that name
        // we do not display the 404 page here because the error came from the code base
        // and not the user going to a url that isn't supported
        invariant(isNullOrUndefined(newRoute), `no route with name ${name} was configured, but router.goTo() was invoked with that name.`);

        newRoute.updateParams(params, query);
        const newViewState = newRoute.viewState;

        const beforeEnterResult = newRoute.getLifecycleCallbackList('beforeEnter').every(cb => {
            const result = cb(newViewState, this._store);
            return !(result === false);
        });
        if (beforeEnterResult === false) {
            return;
        }

        this._currentRoute = newRoute;

        newRoute.getLifecycleCallbackList('onEnter').forEach(cb => {
            cb(newViewState, this._store);
        });
    }

    hasRoute(name: string): boolean {
        return this._routes.has(name);
    }

    @action
    start(routes: Route[], store?: any, notFoundComponent?: React.ComponentType<any>): void {
        if (!isNullOrUndefined(notFoundComponent)) {
            this._notFoundComponent = notFoundComponent;
        }
        this._store = store || null;
        invariant(isNullOrUndefined(routes), 'start requires at least one route');

        // need to traverse the entire tree and ensure names are unique
        this._traverseRouteTreeBreadthFirst(routes, route => {
            invariant(this._routes.has(route.name), `Two or more routes are named ${route.name}`);
            this._routes.set(route.name, route);
        });

        this._setupCurrentPathObserver();
        this._initializeDirector();
    }

    @action
    private _handleDirectorCallback(route: Route, ...urlParamsArray: string[]): void {
        const params = buildPathParamsObject(route.fullPathDefinition, urlParamsArray);
        let queryParamsObject: any;
        try {
            const decodedSearch = decodeURIComponent(window.location.search);
            queryParamsObject = queryString.parse(decodedSearch);
        } catch (e) {
            queryParamsObject = {};
        }
        this.goTo(route.name, params, queryParamsObject);
    }

    @action
    private _handleNotFound() {
        // this is invoked when the director instance
        // doesn't have a configured callback for the brower's
        // current location
        this._currentRoute = {
            component: this._notFoundComponent,
            name: 'notfound',
        } as IRoute;
    }

    // initializes a Director instance to route
    // the browser's current location to the goTo method
    private _initializeDirector() {
        const routes = {};
        this._routes.forEach(route => {
            const path = route.fullPathDefinition;
            if (!isNullOrUndefined(routes[path])) {
                // path already exists in map
                // make sure that this route is nested under
                // the existing route, otherwise throw
                const existingRouteInMap = routes[path];
                const routeIsNested = route.parentRoute.name === existingRouteInMap.name;
                invariant(routeIsNested, `2 or more routes have the same path. ${existingRouteInMap.name} and ${route.name}`);
            }
            routes[route.fullPathDefinition] = this._handleDirectorCallback.bind(this, route);
        });

        const director = new Director(routes);
        director.configure({
            notfound: this._handleNotFound.bind(this),
            html5history: true,
        });
        director.init();
    }

    private _setupCurrentPathObserver(): void {
        autorun(() => {
            if (isNullOrUndefined(this.currentRoute)) return;
            const pathAndQuery = this.currentRoute.pathAndQuery;
            if (pathAndQuery !== null && pathAndQuery !== window.location.pathname + window.location.search) {
                window.history.pushState(null, null, pathAndQuery);
            }
        });
    }

    private _traverseRouteTreeBreadthFirst(routes: Route[], iterator: (route: Route) => void): void {
        routes.forEach(route => {
            iterator(route);
            if (!isNullOrUndefined(route.children)) {
                this._traverseRouteTreeBreadthFirst(route.children, iterator);
            }
        });
    }
}

// create a singleton to export
export const router = new Router();
