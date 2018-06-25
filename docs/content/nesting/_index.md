---
title: "Route Nesting"
weight: 3
---

Nesting routes allows you to compose your UI out of reusable components. It also allows you to protect a certain subset of routes. Consider the following route.

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

Let's take a look at the React components.

### App.tsx

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

Here we can see that the App props has the `routerOutlet` property. This property is set by the router after it decides which route should be shown. It is equal to the child Component for the route. It will be `null` when the route does not have any children.

### Welcome.tsx

Just a really basic welcome component.

```ts
const Welcome = observer((props: {}) => {
    return (
        <h1>Welcome to our site!</h1>
    );
});
```

### Profile.tsx

Just a really basic Profile page.

```ts
const Profile = observer((props: {}) => {
    return (
        <h1>This is the Profile section</h1>
    );
});
```

When the browser is pointed at `/` then both the `<App />` component and the `<Welcome />` component will be rendered. Since the `welcome` route is nested under the `app` route, the `<Welcome />` component will be added as the `props.routerOutlet` prop on the `App` component. This allows the developer to decide where to render the nested component. In this case it's rendered after the `<AppNav />` and before the `<AppFooter />`.

When the browser is pointed at `/profile`, both the `<App />` component and the `<Profile />` component will be rendered.

It's also important to note that in each of the cases above, the `beforeEnter` callback of the `app` route will be invoked. In this case, since the `beforeEnter` callback is checking to make sure the user is logged in, both the `welcome` and `profile` routes are being protected. 
