import * as React from 'react';
import {IParams} from "../buildParams";
import {router} from '../Router';

export interface ILinkProps {
    children?: any;
    className?: string;
    name: string;
    params?: IParams;
    refresh?: boolean;
    style?: any;
    title: string;
}

const Link = (props: ILinkProps) => {
    const {className, name, params, refresh, style, title} = props;
    const handleClick = (e => {
        const middleClick = e.which === 2;
        const cmdOrCtrl = (e.metaKey || e.ctrlKey);
        const openinNewTab = middleClick || cmdOrCtrl;
        const shouldNavigateManually = refresh || openinNewTab || cmdOrCtrl;

        if (!shouldNavigateManually) {
            e.preventDefault();
            router.goTo(name, params);
        }
    });
    const url = router.get(name).buildUrl(params);

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
