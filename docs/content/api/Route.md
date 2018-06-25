---
title: "Route"
weight: 2
---

## Constructor

```
const route = new Route(params: RouteParams);
```

### Route

You create a new Route for every different view or page in your app. Each route must have a unqiue name and can have the following options.

**required** 

**`name: string`**
> the name of the route. Must be unique for all routes.

**`path: string`**
> path at which this route should be activated. These paths can contain path parameters like so: `/profile/:profileId`. Now, when the browser is pointed at `www.yourdomain.com/profile/1234` this route would be activated with the path parameters of `{ profileId: 1234 }`

**`component: React.Component | React.StatelessComponent`**
> the react component to render when this route is active. 

**optional**

**`acceptedQueryParams: string[]`**
> a list of query parameter keys that this route accepts. When this option is set, any query params not in the list will be ignored. Anything is accepted when it is left `undefined`.

**`children: Route[]`**  
> a list of children Route's. See [Nested Routes](#nested-routes) for more info.

**`beforeEnter: (viewState: IViewState, store: Store) => boolean | void`**  
> a lifecycle callback which is invoked just before the router changes to this route. Returning `false` will stop the transition. `viewState` will be the current `viewState`, or the `viewState` before entering this route 

**`onEnter: (viewState: IViewState, store: Store) => boolean | void`**  
> a lifecycle callback which is invoked just after the router changes to this route. Returning `false` from this callback will not do anything special, since the router has already transitioned.

**`beforeExit: (viewState: IViewState, store: Store) => boolean | void`**  
> a lifecycle callback which is invoked just before the router changes from this route. Returning `false` will stop the transition.