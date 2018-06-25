---
title: "Router"
weight: 2
---

### Router

The `Router` class is responsible for managing the list of routes and the current state.
It has the following public API.

**`start<Store>(routes: Route[], store: Store, notFoundComponent?: React.Component) => void`**
> Method that must be called before react renders the `<Router />` component. We pass in our list of route trees so the router can be configured. We also pass in our store here, so the router can pass it to our lifecycle callbacks. There is an optional `notFoundComponent` argument. This is the component that will be rendered when the browser is pointed at an invalid path. Reactx-router has a default component, but it isn't pretty.

**`currentParams: IPathParams`**
> The current path params. This is an observable property.

```typescript
// consider the router was started with a route with path `/cities/:cityId/heros/:heroId/` 
// and the browser was pointed at www.domain.com/cities/new-york-city/heros/iron-man
  
import { router } from '@trevorhanus/reactx-router';
  
const currentPathParams = router.currentParams;
  
console.log(currentPathParams); // { cityId: 'new-york-city', heroId: 'iron-man' }
```

**`currentPath: string`**
> Current path. This is an observable property.

**`currentViewState: IViewState`**
> Current view state, also observable.

**`goTo(name: string, params?: IPathParams, query?: IQueryParams) => void`**
> Method that transitions the current route to the given route. This method can be called from anywhere in the code base.

**`hasRoute(name: string): boolean`**
> simple utility method.

#### Global Singleton

Reactx-router provides a global singleton instance of the Router class. This singleton makes it easy to access the router from an module (or file) in your app. You simply add the `import { router } from 'reactx-router';` statement in any file and you can access the current properties or invoke the Router#goTo method. 

If for some reason this does not suit you, you can import the Router class and create your own instance like so.

```ts
import { Router, ReactxRouter } from 'reactx-router';
  
const myRouter = new Router();
  
myRouter.start<MyStore>(myRoutes, myStore);
  
reactDOM.render(<ReactxRouter router={myRouter} />, domNode);
```