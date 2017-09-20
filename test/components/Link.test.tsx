import { expect } from 'chai';
import { mount } from 'enzyme';
import * as React from 'react';
import { Link } from '../../src/components/Link';
import { Route } from '../../src/Route';
import { router } from '../../src/Router';

describe('Link Component', () => {

    it('renders', () => {
        const route: any = new Route({
            name: 'test',
            path: '/',
            component: () => <div>test</div>,
        });
        router.start([route]);
        const wrapper = mount(<Link name="test">test</Link>);
        expect(wrapper.containsMatchingElement(<a href="/">test</a>)).to.be.true;
    });

    it('throws when route name does not exist', () => {
        expect(() => {
            const wrapper = mount(<Link name="does_not_exist">test</Link>);
        }).to.throw();
    });
});
