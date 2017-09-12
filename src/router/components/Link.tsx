import * as React from 'react';
import {router} from '../Router';
import {IPathParams, IQueryParams} from "../IParams";

export interface ILinkProps {
    children?: any;
    className?: string;
    name: string;
    params?: IPathParams;
    queryParams?: IQueryParams;
    refresh?: boolean;
    style?: any;
    title: string;
}

const Link = (props: ILinkProps) => {
    const {className, name, params, queryParams, refresh, style, title} = props;
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
    const url = router.get(name).pathAndQuery;

    return (
        <a
            className={className || ''}
            style={style || {}}
        >
            {React.cloneElement(React.Children.only(props.children))}
            onClick={handleClick}
            href={url}
        </a>
    )
};

export {
    Link
};
