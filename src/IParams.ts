export interface IParams {
    [paramId: string]: string;
}

export interface IPathParams extends IParams {}
export interface IQueryParams extends IParams {}
