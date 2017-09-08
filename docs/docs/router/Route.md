# Route

A Route associates a Component with a specfic url. We create Route instances and then pass an array of these instances to the router.start(Route[]) method.

## Configuration

When we instantiate the Route class we pass in a configuration object that sets up the route.

```typescript
interface IRouteConfig {
    name: string;
    route: string;
    component: any;
    acceptedQueryParams?: string[]
    beforeEnter?: (state: IViewState) => boolean;
    onEnter?: (state: IViewState) => boolean;
    beforeExit?: (state: IViewState) => boolean;
    onExit?: (state: IViewState) => boolean;
}
```

### Required Params

**name**  
A required field that must be unique for each route.

**route**  
Required. The route with path parameters preceeded by a colon. eg: '/profile/:userId'

**component**  
The React component that should be rendered when this route is entered.

### Optional Params

**acceptedQueryParams**  
An array of strings that indicates the names of acceptable query params. Only params with names included in this array will be recognized when the route loads. This is an added security feature. If left undefined, any param will be accepted. If empty, no query params will be accepted.

#### Lifecycle Callbacks

The lifecycle callbacks allow you to do things during a route transition. You can stop a transition or even switch to a different route from these callbacks. For example, maybe the route needs to be protected so that a user must be logged in before they can enter. You could check to make sure the user is logged in and if they are not switch to the login route. Or maybe you want to fire off a request for data when the user enters a route. 

Returning `false` from a lifecycle callback, will abort the transition.

**beforeEnter**  
Called just before the route is entered.

**onEnter**  
Called just after the route has been entered.

**onExit**  
Called just after the route has been exited and before the 