import * as React from 'react';
import { IPathParams, IQueryParams } from '../IParams';
import { router } from '../Router';
import { invariant, isOr } from '../utils/utils';

export interface ILinkProps {
    children?: any;
    className?: string;
    name: string;
    params?: IPathParams;
    queryParams?: IQueryParams;
    refresh?: boolean;
    style?: any;
}

const MIDDLE_MOUSE_BUTTON = 2;

export const Link = (props: ILinkProps) => {
    const {className, name, params, queryParams, refresh, style} = props;
    const handleClick = (e => {
        const middleClick = e.which === MIDDLE_MOUSE_BUTTON;
        const cmdOrCtrl = (e.metaKey || e.ctrlKey);
        const openinNewTab = middleClick || cmdOrCtrl;
        const shouldNavigateManually = refresh || openinNewTab || cmdOrCtrl;

        if (!shouldNavigateManually) {
            e.preventDefault();
            router.goTo(name, params, queryParams);
        }
    });

    invariant(!router.hasRoute(name), `Can't find route with name ${name} in Link Component.`);

    const url = router.get(name).pathAndQuery;

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
