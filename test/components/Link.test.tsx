import { expect } from 'chai';
import { mount, configure } from 'enzyme';
import * as React from 'react';
import { Link } from '../../src/components/Link';
import { Route } from '../../src/Route';
import { Router } from '../../src/Router';
import * as Adaptor from 'enzyme-adapter-react-16';

configure({adapter: new Adaptor()});

describe('Link Component', () => {

    it('renders', () => {
        const router = new Router();

        const route: any = new Route({
            name: 'test',
            path: '/',
            component: () => <div>test</div>,
        });

        router.start([route]);

        const wrapper = mount(<Link name="test" router={router}>test</Link>);
        expect(wrapper.containsMatchingElement(<a href="/">test</a>)).to.be.true;
    });
});
