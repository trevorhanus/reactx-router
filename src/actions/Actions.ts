import {Dispatcher} from "../../dist/actions/Dispatcher";
import {IAction} from "./AbstractAction";
import {invariant} from "../utils/index";

export class Actions {
    static dispatcher: Dispatcher<any> = null;

    static dispatch(action: IAction<any, any>) {
        invariant(Actions.dispatcher === null, `the dispatcher has not been created. You must call Actions.createDispatcher() before you can dispatch any actions.`);
        Actions.dispatcher.dispatch(action);
    }

    static createDispatcher<Store>(store: Store): Dispatcher<Store> {
        Actions.dispatcher = Dispatcher.create<Store>(store);
        return Actions.dispatcher;
    }
}

export function dispatch(action: IAction<any, any>) {
    return Actions.dispatch(action);
}

export const dispatcher = Actions.dispatcher;
