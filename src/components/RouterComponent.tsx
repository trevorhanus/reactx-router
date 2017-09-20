import { mount } from 'enzyme';
import { observer } from 'mobx-react';
import * as React from 'react';
import { Route } from '../Route';
import {router as globalRouter, Router as RouterClass } from '../Router';

interface IRenderNodeProps {
    route: Route;
    routerOutlet?: any;
}

const RenderNode = observer((props: IRenderNodeProps) => {
    const {route, routerOutlet} = props;

    const Component = route.component;
    const parentRoute = route.parentRoute;

    if (parentRoute != null) {
        return (
            <RenderNode route={parentRoute} routerOutlet={<Component routerOutlet={routerOutlet} />}/>
        );
    } else {
        return (
            <Component routerOutlet={routerOutlet} />
        );
    }
});

export interface IRouterProps {
    router?: RouterClass;
}

export const Router = observer((props: IRouterProps) => {
    const router = props.router != null ? props.router : globalRouter;

    return (
        <RenderNode route={router.currentRoute} routerOutlet={null} />
    );
});
