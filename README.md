# Reactx-Router

$Name is a react router that works well with mobx.

### Overview

*paraphrased from Angular's docs*

Traditional web applications utilize the browser's familiar navigation model:
* Enter a url in the address bar and the browser loads that page.
* Click on links on the page and the browser navigates the url to that page and loads it.
* Click the back and forward button and the browser navigates to the pages in your history.

The Reactx-

### Installing

```bash
$ yarn add @trevorhanus/reactx-router
```

### Basic Usage

```ts
import { App, Profile } from './components';
import { MyStore } from './MyStore';
import { IViewState, Route, router } from '@trevorhanus/reactx-router';
  
const appRoute = new Route({
    name: 'app',
    path: '/',
    component: App,
    beforeEnter: (state: IViewState, store: MyStore) => {
        if (!store.user.loggedIn) {
            router.goTo('login');
            return false;
        }
    },
    children: [
        new Route({
            name: 'profile',
            path: '/profile',
            component: Profile
        })
    ]
});
  
const store = new MyStore();
router.start<MyStore>([appRoute], store);
  
reactDOM.render(<Router />, document.getElementById('app'));
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

### Lifecycle Callbacks

Every route can be passed three optional lifecycle callbacks: `beforeEnter`, `onEnter`, and `beforeExit`. The callbacks are each passed two arguments, `viewState` and `store`. The `viewState` (see `IViewState`) includes data about the current route: `path`, `params`, `queryParams`, and `route`. The `store` is whatever object was passed into the router#start method. These callbacks are invoked when the route is transitioned and allow us to do any setup or teardown that we need to do in our store. For instance, we could fire off a fetch data action or check to make sure the user is logged in.

If either of the `beforeEnter` or `beforeExit` callbacks return `false` the route transition will be terminated. You can also call `router.goTo(<routeName>)` inside a callback to transition to another route. **Warning**: you still must return `false` after this call or the route will not transition.

### Nested Routes

Nesting routes allows you to compose your UI out of reusable components. It also allows you to protect a certain subset of routes. Consider the following route tree.

```ts
const appRoute = new Route({
    name: 'app',
    path: '/',
    component: App,
    beforeEnter: (state: IViewState, store: MyStore) => {
        if (!store.user.loggedIn) {
            router.goTo('login');
            return false;
        }
    },
    children: [
        new Route({
            name: 'welcome',
            path: '/',
            component: Welcome
        }),
        new Route({
            name: 'profile',
            path: '/profile',
            component: Profile
        }),
    ],
});
```
Now take a look at these components

**App.tsx**

```ts
export interface IAppProps {
    routerOutlet?: any;    
}

const App = observer((props: IAppProps) => {
    return (
        <AppHeader />
        <AppNav />
        { props.routerOutlet }
        <AppFooter />
    );
});
```

**Welcome.tsx**

```ts
const Welcome = observer((props: {}) => {
    return (
        <h1>Welcome to our site!</h1>
    );
});
```

**Profile.tsx**

```ts
const Profile = observer((props: {}) => {
    return (
        <h1>This is the Profile section</h1>
    );
});
```

When the browser is pointed at `/` then both the `<App />` component and the `<Welcome />` component will be rendered. Since the `welcome` route is nested under the `app` route, the `<Welcome />` component will be added as the `props.routerOutlet` prop on the `App` component. Now, the developer can decide where in that component to render it.

When the browser is pointed at `/profile`, both the `<App />` component and the `<Profile />` component will be rendered.

It's also important to note that in each of the cases above, the `beforeEnter` callback of the `app` route will be invoked. In this case, since the `beforeEnter` callback is checking to make sure the user is logged in, both the `welcome` and `profile` routes are being protected. 

### Running the Tests

make sure you have everything installed
```bash
$ yarn install
```

run the tests

```bash
$ yarn test
```
