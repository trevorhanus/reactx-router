import {observable, computed, action, IObservableArray} from 'mobx';
import {IReversibleAction} from './AbstractReversibleAction';

export interface IUndoManager<Store> {
    canRedo: boolean;
    canUndo: boolean;
    registerAction: (action: IReversibleAction<Store, any>) => void;
    undo: (store: Store) => void;
    redo: (store: Store) => void;
}

export class UndoManager<Store> {
    @observable private _undoStack: IObservableArray<IReversibleAction<Store, any>>;
    @observable private _redoStack: IObservableArray<IReversibleAction<Store, any>>;

    constructor() {
        this._undoStack = observable.array<IReversibleAction<Store, any>>();
        this._redoStack = observable.array<IReversibleAction<Store, any>>();
    }

    @computed
    get canRedo(): boolean {
        return (this._redoStack as Array<IReversibleAction<Store, any>>).length > 0;
    }

    @computed
    get canUndo(): boolean {
        return (this._undoStack as Array<IReversibleAction<Store, any>>).length > 0;
    }

    @action
    registerAction(actn: IReversibleAction<Store, any>): void {
        // clear the redo stack
        this._redoStack.clear();
        this._undoStack.push(actn);
    }

    @action
    undo(store: Store): void {
        if (!this.canUndo) return;
        const action = this._undoStack.pop();
        action.undo(store);
        this._redoStack.push(action);
    }

    @action
    redo(store: Store): void {
        if (!this.canRedo) return;
        const action = this._redoStack.pop();
        action.redo(store);
        this._undoStack.push(action);
    }
}
