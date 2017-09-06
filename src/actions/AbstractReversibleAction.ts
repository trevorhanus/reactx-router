import {invariant} from '../utils';
import {IAction, AbstractAction} from './AbstractAction';

export interface IReversibleAction<Store, Params> extends IAction<Store, Params> {
    isReversible: boolean;
    undo: (store: Store) => void;
    redo: (store: Store) => void;
    appendDebounceParams: (params: Params) => void;
}

export abstract class AbstractReversibleAction<Store, Params> extends AbstractAction<Store, Params> implements IReversibleAction<Store, Params> {
    isReversible: boolean;
    private _lastInvokationType: 'none' | 'invoke' | 'undo' | 'redo';
    private _wasInvoked: boolean;

    constructor() {
        super();
        this.isReversible = true;
        this._lastInvokationType = 'none';
        this._wasInvoked = false;
    }

    invoke(store: Store): void {
        invariant(this._wasInvoked, `invoke method on Action ${this.name} was called more than once.`);
        this._wasInvoked = true;
        this._lastInvokationType = 'invoke';
    }

    undo(store: Store): void {
        invariant(!this._wasInvoked, `action ${this.name} cannot be undone before it was inovoked`);
        invariant(this._lastInvokationType === 'undo', `action ${this.name} cannot be undone after it was just undone`);
        this._lastInvokationType = 'undo';
    }

    redo(store: Store): void {
        invariant(!this._wasInvoked, `action ${this.name} cannot be redone before it was inovoked`);
        invariant(this._lastInvokationType !== 'undo', `action ${this.name} cannot be redone before it was ever undone`);
        this._lastInvokationType = 'redo';
    }

    appendDebounceParams(params: any): void {
        // not all actions will require a method here to be reversed.
        // default will be no-op
    }
}
