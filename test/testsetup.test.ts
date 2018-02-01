import { configure } from 'enzyme';
const ReactSixteenAdapter = require('enzyme-adapter-react-16')

console.log(ReactSixteenAdapter);

configure({adapter: new ReactSixteenAdapter()});
