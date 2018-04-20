export interface IRouteConfig {
    name: string;
    path: string;
    component: React.ComponentType<any>;
    acceptedQueryParams?: string[];
    children?: IRoute[];
    beforeEnter?: ILifecycleCallback;
    onEnter?: INonblockingLifecycleCallback;
    beforeExit?: ILifecycleCallback;
}

export interface IRoute {
    readonly name: string; // unique name
    readonly component: React.ComponentType<any>;
    readonly path: string; // path with path params replaced, does not include parent. always starts with a '/'
    readonly fullPath: string; // path with path params replaced, includes any parent paths
    readonly acceptedQueryParams: string[]; // list of accepted query params, anything else will be ignored
    readonly parentRoute: IRoute;
    readonly children: IRoute[];
    beforeEnter(state: ILifeCycleViewStates, store?: any): boolean | void;
    beforeExit(state: ILifeCycleViewStates, store?: any): boolean | void;
    onEnter(state: ILifeCycleViewStates, store?: any): boolean | void;
    getLifecycleCallbackList(lifecycleName: string): ILifecycleCallback[]; // a list of callbacks with the top-most route's callback at index 0
    buildUri(pathParams?: IPathParams, queryParams?: IQueryParams, hash?: string): string;
    setParentRoute(route: IRoute): void;
}

export interface IViewState {
    route: IRoute;
    params: IPathParams;
    query: IQueryParams;
    hash: string;
}

export interface ILifeCycleViewStates {
    previousViewState?: IViewState;
    currentViewState: IViewState;
    nextViewState?: IViewState;
}

export interface IRouter {
    currentParams: IPathParams; // depricated for currentPathParams
    currentPath: string;
    currentViewState: IViewState;
    get(name: string): IRoute;
    goTo(name: string, params?: IPathParams, query?: IQueryParams): void;
    hasRoute(name: string): boolean;
}

export interface IParams {
    [paramId: string]: string;
}

export interface IPathParams extends IParams {}
export interface IQueryParams extends IParams {}

export type ILifecycleCallback = (state: ILifeCycleViewStates, store?: any) => boolean | void;
export type INonblockingLifecycleCallback = (state: ILifeCycleViewStates, store?: any) => void;
