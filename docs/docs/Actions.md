# Actions

## Usage

```typescript
import {MyStore} from './MyStore';
import {ActionStore, Action} from 'reactx-ui';

export interface MyActionParams {

}

class MyAction extends Action {
    name = 'MY_ACTION'; // we dispatch actions by name

    do(store: MyStore, params: MyActionParams) {
        
    }
}
```