const cleanup = require('jsdom-global')(); // lets us access a global document variable

import {Route} from "../../src/router/Route";
import {expect} from 'chai';
import {Router} from '../../src/router/Router';

describe('Router', () => {

    beforeEach(() => {
    });

    afterEach(() => {
        cleanup();
    });

    describe('constructor', () => {

        it('works', () => {
            const router = new Router();
            expect(router).to.be.ok;
        });
    });

    describe('start', () => {

        it('throws with no routes', () => {
            const router = new Router();
            expect(() => {
                router.start(null);
            }).to.throw();
        });

        it('throws when two routes have same name', () => {
            const router = new Router();
            const route1: any = {name: 'test'};
            const route2: any = {name: 'test'};
            expect(() => {
                router.start([route1, route2]);
            }).to.throw();
        });

        it('starts at browsers location', () => {
            const router = new Router();
            const home: any = new Route({
                name: 'home',
                route: '/home',
                component: 'test'
            });
            router.start([home]);
            expect(router.currentPath).to.be('/home');
        });
    });
});