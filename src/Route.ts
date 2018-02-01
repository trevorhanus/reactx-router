import { pick as _pick } from 'lodash';
import * as path from 'path';
import { identity, invariant, isNullOrUndefined, replacePathParams, urlEncodeQueryParams } from './utils/utils';
import { ILifecycleCallback, INonblockingLifecycleCallback, IRoute, IRouteConfig, IPathParams, IQueryParams } from './interfaces';

export class Route implements IRoute {
    private _name: string;
    private _path: string;
    private _component: React.ComponentType<any>;
    private _acceptedQueryParams: string[];
    private _children: IRoute[];
    private _parentRoute: IRoute;
    beforeEnter: ILifecycleCallback;
    onEnter: INonblockingLifecycleCallback;
    beforeExit: ILifecycleCallback;

    constructor(config: IRouteConfig) {
        invariant(isNullOrUndefined([config.component, config.name, config.path]), 'route config must have name, route, and component props.');
        this._name = config.name;
        this._component = config.component;
        this._path = config.path;
        this._acceptedQueryParams = config.acceptedQueryParams;
        this._parentRoute = null;
        this._children = [];
        this.beforeEnter = config.beforeEnter != null ? config.beforeEnter : identity;
        this.onEnter = config.onEnter != null ? config.onEnter : identity;
        this.beforeExit = config.beforeExit != null ? config.beforeExit : identity;
        this._appendChildRoutes(config.children);
    }

    get name(): string {
        return this._name;
    }

    get path(): string {
        return this._path;
    }

    get component(): React.ComponentType<any> {
        return this._component;
    }

    get acceptedQueryParams(): string[] {
        return this._acceptedQueryParams;
    }

    get children(): IRoute[] {
        return this._children;
    }

    get parentRoute(): IRoute {
        return this._parentRoute;
    }

    get fullPath(): string {
        return this.parentRoute ? path.join(this.parentRoute.fullPath, this.path) : this.path;
    }

    buildUri(pathParams: IPathParams = {}, queryParams: IQueryParams = {}, hash: string = ''): string {
        // first replace the path params
        let uri = replacePathParams(this.fullPath, pathParams);
        // now append the queryParams
        const accepted = this.acceptedQueryParams;
        const qParams = ( queryParams != null && accepted != null ) ? _pick(queryParams, accepted) : queryParams;
        uri += urlEncodeQueryParams(qParams);
        uri += hash != null ? hash : '';
        return uri;
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

    setParentRoute(parent: IRoute) {
        this._parentRoute = parent;
    }

    private _appendChildRoutes(children?: IRoute[]) {
        if (isNullOrUndefined(children)) return;
        children.forEach(this._addChildRoute.bind(this));
    }

    private _addChildRoute(route: IRoute): void {
        this._children.push(route);
        route.setParentRoute(this);
    }
}
