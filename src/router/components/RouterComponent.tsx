import * as React from 'react';
import {isNullOrUndefined} from "../../utils/utils";
import {mount} from 'enzyme';
import {observer} from 'mobx-react';
import {Route} from '../Route';
import {Router as RouterClass} from '../Router';
import {router as globalRouter} from '../Router';

interface IRenderNodeProps {
    route: Route;
    routerOutlet?: any;
}

const RenderNode = observer((props: IRenderNodeProps) => {
    const {route, routerOutlet} = props;

    const Component = route.component;
    const parentRoute = route.parentRoute;

    if (!isNullOrUndefined(parentRoute)) {
        return (
            <RenderNode route={parentRoute} routerOutlet={<Component routerOutlet={routerOutlet} />}/>
        )
    } else {
        return (
            <Component routerOutlet={routerOutlet} />
        )
    }
});

export interface IRouterProps {
    router?: RouterClass;
}

const Router = observer((props: IRouterProps) => {
    const router = props.router || globalRouter;

    return (
        <RenderNode route={router.currentRoute} routerOutlet={null} />
    )
});

export {
    Router
};
