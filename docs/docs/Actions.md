# Actions

## Usage

```typescript
import {MyStore} from './MyStore';
import {ActionStore, Action} from 'reactx-ui';

export interface MyActionParams {

}

class MyAction extends Action {

    invoke(store: MyStore, params: MyActionParams) {
        
    }
}
```