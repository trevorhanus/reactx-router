import * as React from 'react';
import {router} from '../Router';
import {IPathParams, IQueryParams} from "../IParams";
import {invariant, isNullOrUndefined} from "../../utils/utils";

export interface ILinkProps {
    children?: any;
    className?: string;
    name: string;
    params?: IPathParams;
    queryParams?: IQueryParams;
    refresh?: boolean;
    style?: any;
}

const Link = (props: ILinkProps) => {
    const {className, name, params, queryParams, refresh, style} = props;
    const handleClick = (e => {
        const middleClick = e.which === 2;
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
            className={className || null}
            style={style || {}}
            onClick={handleClick}
            href={url}
        >
            {
                !isNullOrUndefined(props.children)
                ? props.children
                : null
            }
        </a>
    )
};

export {
    Link
};
