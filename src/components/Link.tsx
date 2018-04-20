import * as React from 'react';
import { router } from '../Router';
import { invariant, isOr } from '../utils/utils';
import { IPathParams, IQueryParams, IRouter } from '../interfaces';

export interface ILinkProps {
    name: string;
    children?: any;
    className?: string;
    keepScroll?: boolean;
    params?: IPathParams;
    queryParams?: IQueryParams;
    refresh?: boolean;
    style?: any;
    router?: IRouter;
}

const MIDDLE_MOUSE_BUTTON = 2;

export const Link = (props: ILinkProps) => {
    const {className, name, params, queryParams, refresh, style} = props;
    const targetRouter = props.router != null ? props.router : router;

    const handleClick = (e => {
        const middleClick = e.which === MIDDLE_MOUSE_BUTTON;
        const cmdOrCtrl = (e.metaKey || e.ctrlKey);
        const openInNewTab = middleClick || cmdOrCtrl;
        const shouldNavigateManually = refresh || openInNewTab || cmdOrCtrl;
        const keepScroll = props.keepScroll != null ? props.keepScroll : false;

        if (!shouldNavigateManually) {
            e.preventDefault();
            targetRouter.goTo(name, params, queryParams);
            if (!keepScroll) {
                window.scrollTo(0, 0);
            }
        }
    });

    invariant(!targetRouter.hasRoute(name), `Can't find route with name ${name} in Link Component.`);

    const url = targetRouter.get(name).buildUri(params, queryParams);

    return (
        <a
            className={isOr(className, null)}
            style={isOr(style, {})}
            onClick={handleClick}
            href={url}
        >
            {
                props.children != null
                ? props.children
                : null
            }
        </a>
    );
};
