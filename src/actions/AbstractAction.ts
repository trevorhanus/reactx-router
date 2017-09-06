import {v4 as uuidv4} from 'uuid';

export interface IAction<Store, Params> {
    id: string;
    name: string;
    isReversible: boolean;
    params: Params;
    invoke: (store: Store) => any;
}

export abstract class AbstractAction<Store, Params> implements IAction<Store, Params> {
    id: string;
    isReversible: boolean;
    params: Params;
    abstract name: string;

    constructor(params?: any) {
        this.id = uuidv4();
        this.isReversible = false;
        this.params = params;
    }

    invoke(store: Store): any {
        throw new Error(`Invoke was not implemented in action ${this.name}`);
    };
}
