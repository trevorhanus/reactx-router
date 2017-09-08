# Router Overview

## Example Usage

First set up the routes and make sure the `<Router />` component is rendered high in the tree.

```typescript
import * as ReactDOM from 'react-dom';
import {Home, Profile} from './path/to/components';
import {router, Route, Router, IViewState} from '@trevorhanus/reactx';
  
const home = new Route({
    name: 'home',
    route: '/',
    component: Home,
    beforeEnter: (state: IViewState) => {
        // do something before we enter the view 
    }
});
  
const profile = new Route({
    name: 'profile',
    route: 'users/:userId',
    component: Profile,
    acceptedQueryParams: ['foo']
});
  
router.start([home, profile]);
  
ReactDOM.render(<Router />, document.getElementById('app'));
```

Then link to the routes by rendering a `<Link />` component.

```typescript
import * as React from 'react';
import {Link} from '@trevorhanus/reactx';
  
const MyComponent = () => {
    
    return (
        <div className="links">
            <Link routeName='home'>Home</Link>
            <Link 
                routeName='profile'
                urlParams={{userId: 'some_user_id'}}
                queryParams={{foo: 'bar'}}
            >
                Home
            </Link>
        </div>
    )
}
```

Or change the route progamatically from anywhere

```typescript
import {router} from '@trevorhanus/reactx';
  
router.goTo('profile', {userId: 'some_user_id'}, {foo: 'bar'});
```