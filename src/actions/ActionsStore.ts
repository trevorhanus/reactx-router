import {ObservableMap, observable} from 'mobx';
import {IAction, IActionConstructor} from './IAction';

export class ActionsStore<Store> {
    private store: Store;
    private actions: ObservableMap<IAction>;

    constructor(store: Store, actions: {[fnName: string]: IActionConstructor}) {
        this.store = store;
        this.actions = observable.map<IAction>();
        Object.keys(actions).forEach((fnName: string) => {
            const actionConstructor: IActionConstructor = actions[fnName];
            const action = new actionConstructor();
            this.actions.set(action.name, action);
        });
    }

    public dispatch(name: string, params?: any): Promise<any> | void {
        if (!this.actions.has(name)) {
            throw new Error(`Could not find action with name ${name}`);
        }

        // console.log(`Dispatching ${name} with params ${JSON.stringify(params)}`);

        const action = this.actions.get(name);
        return action.do(this.store, params);
    }

    public get all(): IAction[] {
        return this.actions.values();
    }

    public getAction(actionName: string): IAction {
        return this.actions.get(actionName);
    }
}
