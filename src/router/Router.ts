import * as queryString from 'query-string';
import {buildParams, IParams} from "./buildParams";
import {autorun, observable, computed, action} from 'mobx';
import {getDefault404Route} from "./Default404";
import {invariant, identity, isNullOrUndefined} from '../utils';
import {Route, IViewState} from './Route';
import {Router as Director} from 'director/build/director';

export interface IRouter {
    currentParams: IParams;
    currentPath: string;
    currentViewState: IViewState;
    goTo: (name: string, params: IParams) => void;
}

export class Router implements IRouter {
    private _routes: Map<string, Route>;
    @observable.ref private _currentRoute: Route;

    constructor() {
        this._routes = new Map<string, Route>();
        this._currentRoute = null;
    }

    @computed
    get currentParams(): IParams {
        return this._currentRoute !== null ? this._currentRoute.params : null;
    }

    @computed
    get currentPath(): string {
        return this._currentRoute !== null ? this._currentRoute.path : null;
    }

    @computed
    get currentViewState(): IViewState {
        return this._currentRoute !== null ? this._currentRoute.viewState : null;
    }

    @action
    goTo(name: string, params?: IParams) {
        const currentRoute = this._currentRoute;
        const currentViewState = currentRoute.viewState;

        const beforeExit = currentRoute && currentRoute.beforeExit || identity;
        const onExit = currentRoute && currentRoute.onExit || identity;

        const newRoute = this._routes.get(name);
        newRoute.applyParams(params);
        const newViewState = newRoute.viewState;

        const beforeEnter = newRoute.beforeEnter || identity;
        const onEnter = newRoute.onEnter || identity;

        handleLifeCycleCallback(beforeExit, currentViewState)
            .then(() => {
                return handleLifeCycleCallback(onExit, currentViewState);
            })
            .then(() => {
                return handleLifeCycleCallback(beforeEnter, newViewState);
            })
            .then(() => {
                return handleLifeCycleCallback(onEnter, newViewState);
            })
            .then(() => {
                this._currentRoute = newRoute;
            })
            .catch(err => {
                if (err.message === 'break_goto') {
                    return;
                } else {
                    throw err;
                }
            });
    }

    @action
    public start(routes: Route[]): void {
        invariant(isNullOrUndefined(routes), 'start requires at least one route');

        routes.forEach(route => {
            invariant(this._routes.has(route.name), `Two or more routes are named ${route.name}`);
            this._routes.set(route.name, route);
        });

        if (!this._routes.has('404')) {
            this._routes.set('404', getDefault404Route());
        }
        this._setupCurrentPathObserver();
        this._startRouter();
    }

    @action
    private _handleBrowserUrlChange(viewName: string, ...urlParamsArray: string[]): void {
        const route = this._routes.get(viewName);
        invariant(!route, 'could not find view with name ${viewName}');

        const queryParamsObject = queryString.parse(window.location.search);
        const params = buildParams(route.route, route.acceptedQueryParams, urlParamsArray, queryParamsObject);
        this.goTo(viewName, params);
    }

    private _startRouter() {
        const routes = {};
        this._routes.forEach(view => {
            if (view.name !== '404') {
                routes[view.path] = this._handleBrowserUrlChange.bind(this, view.name);
            }
        });

        const director = new Director(routes);
        director.configure({
            notfound: this._handleBrowserUrlChange.bind(this, '404'),
            html5history: true
        });
        director.init();
    }

    private _setupCurrentPathObserver(): void {
        autorun(() => {
            const path = this.currentPath;
            if (path !== window.location.pathname) {
                window.history.pushState(null, null, path);
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
