import { expect } from 'chai';
import { mount } from 'enzyme';
import { observer } from 'mobx-react';
import * as React from 'react';
import {Router as RouterComponent } from '../../src/components/RouterComponent';
import { Route } from '../../src/Route';
import { Router } from '../../src/Router';

interface IIndexProps {
    routerOutlet?: any;
}

const Index = observer((props: any) => {
    return (
        <div>
            <div>index</div>
            {props.routerOutlet}
        </div>
    );
});

const Nested = (props: IIndexProps) => {
    return (
        <div>
            <div>nested</div>
            {props.routerOutlet}
        </div>
    );
};

const NestedNested = (props: any) => {
    return (
        <div>nestednested</div>
    );
};

describe('Router Component', () => {

    it('renders single component', () => {
        const router = new Router();
        const home: any = new Route({
            name: 'home',
            path: '/home',
            component: Index,
            children: [
                new Route({
                    name: 'nested',
                    path: '/:userId',
                    component: Nested,
                }),
            ],
        });
        window.history.pushState(null, null, '/home');
        router.start([home]);
        const wrapper = mount(<RouterComponent router={router} />);
        expect(wrapper.contains(<div>index</div>)).to.be.true;
        expect(wrapper.contains(<div>nested</div>)).to.be.false;
    });

    it('renders tree with nested components', () => {
        const router = new Router();
        const index: any = new Route({
            name: 'index',
            path: '/',
            component: Index,
            children: [
                new Route({
                    name: 'nested',
                    path: '/:nestedId',
                    component: Nested,
                    children: [
                        new Route({
                            name: 'nestednested',
                            path: '/:nestedNestedId',
                            component: NestedNested,
                        }),
                    ],
                }),
            ],
        });
        window.history.pushState(null, null, '/1234/5678');
        router.start([index]);
        expect(router.currentRoute.fullPath).to.equal('/1234/5678');
        const wrapper = mount(<RouterComponent router={router} />);
        expect(wrapper.contains(<div>index</div>)).to.be.true;
        expect(wrapper.contains(<div>nested</div>)).to.be.true;
        expect(wrapper.contains(<div>nestednested</div>)).to.be.true;
        router.goTo('nested', {nestedId: '1234'});
        expect(wrapper.contains(<div>index</div>)).to.be.true;
        expect(wrapper.contains(<div>nested</div>)).to.be.true;
        expect(wrapper.contains(<div>nestednested</div>)).to.be.false;
    });

    it('renders default 404 component when path is not found', () => {
        const router = new Router();
        const home: any = new Route({
            name: 'home',
            path: '/home',
            component: Index,
        });
        window.history.pushState(null, null, '/derp');
        router.start([home]);
        const wrapper = mount(<RouterComponent router={router} />);
        expect(wrapper.contains(<div><h1>404: Not Found</h1></div>)).to.be.true;
    });

    it('renders given 404 component when path is not found', () => {
        const NotFound = () => {
            return (
                <div>error</div>
            );
        };
        const router = new Router();
        const home: any = new Route({
            name: 'home',
            path: '/home',
            component: Index,
        });
        window.history.pushState(null, null, '/derp');
        router.start([home], null, NotFound);
        const wrapper = mount(<RouterComponent router={router} />);
        expect(wrapper.contains(<div>error</div>)).to.be.true;
    });
});
