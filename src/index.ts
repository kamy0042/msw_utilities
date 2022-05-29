import {SetupServerApi} from "msw/node";

// リクエストパラメータをオブジェクトの形で取得
export const parseURLSearchParams = (params:URLSearchParams):Record<string, string|number|boolean> => {
    const obj = {} as Record<string, string|number|boolean>;
    params.forEach((v,k) => {
        if(v === 'true' || v === 'false') {
            obj[k] = v === 'true'
        } else if(!Number.isNaN(Number(v))) {
            obj[k] = Number(v);
        } else {
            obj[k] = v;
        }
    })

    return obj;
}


type Spy = jest.Mock<void, [RequestInfo]>;
type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';
type RequestInfo = {
    searchParams:Record<string, string|number|boolean>;
    pathname:string;
    method:Method;
}

/**
 *  msw に spy を仕込む
 *
 *  例：
 *  let server:SetupServerApi;
 *  beforeAll(() => {
 *      server = setupServer(handlers);
 *      server.listen();
 *  })
 *  afterAll(() => server.close())'
 *
 *  test('foo test', async() => {
 *      const spy = spyMswRequest;
 *      // ...
 *      expect(spy).toHaveBeenCalledWith(
 *          expect.objectContaining(
 *              createRequestInfo({
 *                  pathname:'path',
 *                  searchParams:params,
 *              })
 *          )
 *      )
 *  })
 *
 *
 */
export const spyMswRequest = (server:SetupServerApi):Spy => {
    const mock:Spy = jest.fn<void, [RequestInfo]>();
    server.events.on('request:start', ({url:{searchParams, pathname}, method}) =>
        mock({
            searchParams: parseURLSearchParams(searchParams),
            pathname,
            method: method.toUpperCase() as Method
        })
    );
    return mock;
}

// spy が引数で受け取るオブジェクトを作成。目的：型によるプロパティのサジェストを受ける
export const createRequestInfo = (info:Partial<RequestInfo>):Partial<RequestInfo> => {
    return info;
}