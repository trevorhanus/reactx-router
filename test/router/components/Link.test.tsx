import * as React from 'react';
import {expect} from 'chai';
import {mount} from 'enzyme';
import {Link} from '../../../src/router/components/Link';
import {router} from '../../../src/router/Router';
import {Route} from '../../../src/router/Route';

describe('Link Component', () => {

    it('renders', () => {
        const route: any = new Route({
            name: 'test',
            path: '/',
            component: () => <div>test</div>
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
