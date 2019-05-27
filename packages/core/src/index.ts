// TODO: not yet handled in any wrappers
export interface Contract {
  standard:string;
  version:string;
  account:string;
}

// TODO: Only handled in dgoods currently
export interface Token {
  contract:Contract;
  id:string;
  name:string;
  quantity:number | string;
  json:any | null;
  owner:string;

  image():Promise<string>
  metadata():Promise<any>
}

export interface TokenWrapper {
  getBalances(...args: any[]):Promise<Array<Token>>
}