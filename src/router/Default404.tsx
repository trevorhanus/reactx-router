import * as React from 'react';
import {Route} from "./Route";

const Default404View = () => {
    return (
        <div>
            <h1>404: Not Found</h1>
        </div>
    )
};

export {
    Default404View
};

export function getDefault404Route() {
    return new Route({
        name: '404',
        route: '',
        component: Default404View
    });
}
