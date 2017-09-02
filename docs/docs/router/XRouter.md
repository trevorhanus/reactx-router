# Router

## Concepts

Uses the [director](https://www.npmjs.com/package/director) npm module which watches the location of the browser

## Usage

```typescript
import {router, Route, IViewState} from 'reactx';
import {Home} from './components/Home';
  
// Set up our routes
const routes = [
    new Route({
        path: '/home',
        name: 'home',
        component: Home,
        beforeEnter: (state: IViewState) => {
            // do stuff before we enter the view
        }
    }),
    new Route({
        path: '/home',
        name: 'home',
        component: Home,
        beforeEnter: (state: IViewState) => {
            // do stuff before we enter the view
            // returning false will stop the route change
            // returning a promise will make the router wait until the promise has
            // fulfilled to move on
        }
    })
];
  
// start the router
router.start(routes);
  
// render the router component
Reactdom.render(<Router />, here);
```

## Life Cycle Callbacks

Calling router.goto inside a callback

Returning false from beforeEnter or onEnter will stop the route change

If you return a Promise from any callback
