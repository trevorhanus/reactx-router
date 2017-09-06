import {IUndoManager} from "./UndoManager";
import {Timer} from '@trevorhanus/timer';
import {IReversibleAction} from "./AbstractreversibleAction";

export interface IDebounceManager {
    isDebounced: (action: IReversibleAction<any, any>) => boolean;
    debounce: (action: IReversibleAction<any, any>, duration: number) => void;
}

export class DebounceManager implements IDebounceManager {
    private _undoManager: IUndoManager<any>;
    private _debouncedActions: Map<string, IReversibleAction<any, any>>;
    private _timer: Timer;

    constructor(undoManager: IUndoManager<any>) {
        this._undoManager = undoManager;
        this._debouncedActions = new Map<string, IReversibleAction<any, any>>();
        this._timer = new Timer();
    }

    debounce(action: IReversibleAction<any, any>, duration: number): void {
        // if it is already debounced then append the params
        if (this.isDebounced(action)) {
            const debouncedAction = this._debouncedActions.get(action.name);
            debouncedAction.appendDebounceParams(action.params);
        } else {
            this._debouncedActions.set(action.name, action);
        }

        // reset or set the bounce timer
        this._setFinishTimer(action, duration);
    }

    isDebounced(action: IReversibleAction<any, any>): boolean {
        return this._debouncedActions.has(action.name);
    }

    private _setFinishTimer(action: IReversibleAction<any, any>, duration: number) {
        if (this._timer.isPending(action.name)) {
            this._timer.cancel(action.name);
        }
        this._timer.register(action.name, this._finish.bind(this, action.name), duration);
    }

    private _finish(actionName: string): void {
        const debouncedAction = this._debouncedActions.get(actionName);
        this._undoManager.registerAction(debouncedAction);
        this._debouncedActions.delete(actionName);
    }
}
