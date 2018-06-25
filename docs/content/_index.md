---
title: "Router"
weight: 1
---

$Name is a React router that works well with mobx.

## Motivation

A little something about the motivation for $Name.

## Why do we need a router?

*paraphrased from Angular's docs*

Traditional web applications utilize the browser's familiar navigation model:

* Enter a url in the address bar and the browser loads that page.
* Click on links on the page and the browser navigates the url to that page and loads it.
* Click the back and forward button and the browser navigates to the pages in your history.


### Installing

```bash
$ yarn add @trevorhanus/reactx-router
```

### Basic Usage

```ts
import { IViewState, Route, router, Router } from '@trevorhanus/reactx-router';
import { Home, Profile } from './components';
import { MyStore } from './MyStore';
  
const home = new Route({
    name: 'home',
    path: '/',
    component: App,
});
  
const profile = new Route({
    name: 'profile',
    path: '/profile',
    component: Profile,
});
  
const routes = [ home, profile ];
  
const store = new MyStore();
router.start(routes, store);
  
reactDOM.render(<Router />, document.getElementById('app'));
```

Let's break this down line by line.

**`import { IViewState, Route, router, Router } from '@trevorhanus/reactx-router';`**

#### Global Singleton

Reactx-router provides a global singleton instance of the Router class. This singleton makes it easy to access the router from any module (or file) in your app. You simply add the `import { router } from 'reactx-router';` statement in any file and you can access the current properties or invoke the Router#goTo method.  

If for some reason this does not suit you, you can import the Router class and create your own instance like so.

```ts
import { Router, ReactxRouter } from 'reactx-router';
  
const myRouter = new Router();
  
myRouter.start(myRoutes, myStore);
  
reactDOM.render(<ReactxRouter router={myRouter} />, domNode);
```

### Lifecycle Callbacks

Every route can be passed three optional lifecycle callbacks: `beforeEnter`, `onEnter`, and `beforeExit`. The callbacks are each passed two arguments, `viewState` and `store`. The `viewState` (see `IViewState`) includes data about the current route: `path`, `params`, `queryParams`, and `route`. The `store` is whatever object was passed into the router#start method. These callbacks are invoked when the route is transitioned and allow us to do any setup or teardown that we need to do in our store. For instance, we could fire off a fetch data action or check to make sure the user is logged in.

If either of the `beforeEnter` or `beforeExit` callbacks return `false` the route transition will be terminated. You can also call `router.goTo(<routeName>)` inside a callback to transition to another route. **Warning**: you still must return `false` after this call or the route will not transition.

