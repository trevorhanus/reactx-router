import { Router as Director } from 'director/build/director';
import { action, autorun, computed, observable } from 'mobx';
import * as queryString from 'query-string';
import { Default404View } from './components/Default404';
import { IPathParams, IQueryParams, IRoute, IRouter, IViewState } from './interfaces';
import { buildPathParamsObject, invariant, isNullOrUndefined } from './utils/utils';
import { Route } from './Route';

export class Router implements IRouter {
    private _notFoundComponent: React.ComponentType<any>;
    private _routes: Map<string, IRoute>;
    private _store: any;
    @observable.ref private _pathParams: IPathParams;
    @observable.ref private _queryParams: IQueryParams;
    @observable private _hash: string;
    @observable.ref private _currentRoute: IRoute;

    constructor() {
        this._notFoundComponent = Default404View;
        this._routes = new Map<string, IRoute>();
        this._store = null;
        this._pathParams = null;
        this._queryParams = null;
        this._hash = null;
        this._currentRoute = null;
    }

    @computed
    get currentParams(): IPathParams {
        return this._pathParams;
    }

    @computed
    get currentPathParams(): IPathParams {
        return this._pathParams;
    }

    @computed
    get currentPath(): string {
        return this._currentRoute !== null
            ? this._currentRoute.buildUri(this._pathParams, this._queryParams, this._hash)
            : null;
    }

    @computed
    get currentRoute(): IRoute {
        return this._currentRoute;
    }

    @computed
    get currentViewState(): IViewState {
        return {
            params: this._pathParams,
            query: this._queryParams,
            hash: this._hash,
            currentRoute: this._currentRoute,
        };
    }

    get(name: string): IRoute {
        return this._routes.get(name);
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
    goTo(name: string, params?: IPathParams, query?: IQueryParams, hash?: string) {
        const currentRoute = this._currentRoute;

        const beforeExitResult = !isNullOrUndefined(currentRoute)
            ? currentRoute.getLifecycleCallbackList('beforeExit').every(cb => {
                const result = cb(this.currentViewState, this._store);
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

        this._pathParams = params;
        this._queryParams = query;
        this._hash = hash;

        const beforeEnterResult = newRoute.getLifecycleCallbackList('beforeEnter').every(cb => {
            const result = cb(this.currentViewState, this._store);
            return !(result === false);
        });
        if (beforeEnterResult === false) {
            return;
        }

        this._currentRoute = newRoute;

        newRoute.getLifecycleCallbackList('onEnter').forEach(cb => {
            cb(this.currentViewState, this._store);
        });
    }

    @action
    private _handleDirectorCallback(route: IRoute, ...urlParamsArray: string[]): void {
        const params = buildPathParamsObject(route.fullPath, urlParamsArray);
        let queryParamsObject: any;
        try {
            const decodedSearch = decodeURIComponent(window.location.search);
            queryParamsObject = queryString.parse(decodedSearch);
        } catch (e) {
            queryParamsObject = {};
        }
        this.goTo(route.name, params, queryParamsObject, window.location.hash);
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
            const path = route.fullPath;
            if (!isNullOrUndefined(routes[path])) {
                // path already exists in map
                // make sure that this route is nested under
                // the existing route, otherwise throw
                const existingRouteInMap = routes[path];
                const routeIsNested = route.parentRoute.name === existingRouteInMap.name;
                invariant(routeIsNested, `2 or more routes have the same path. ${existingRouteInMap.name} and ${route.name}`);
            }
            routes[route.fullPath] = this._handleDirectorCallback.bind(this, route);
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
            if (this._currentRoute != null) {
                const uri = this._currentRoute.buildUri(this._pathParams, this._queryParams, this._hash);
                const windowUri = window.location.pathname + window.location.search + window.location.hash;
                if (uri != null && uri !== windowUri) {
                    window.history.pushState(null, null, uri);
                }
            }
        });
    }

    private _traverseRouteTreeBreadthFirst(routes: IRoute[], iterator: (route: IRoute) => void): void {
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
