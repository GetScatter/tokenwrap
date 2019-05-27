// @ts-ignore
import {TokenWrapper} from '@tokenwrap/core';

export default class Tokenwrap {

  readonly wrappers:Array<TokenWrapper>;

  constructor(wrappers:Array<TokenWrapper>){
    this.wrappers = wrappers;
  }

  async getTokens(owner:string){
    return (await Promise.all(this.wrappers.map(wrapper => {

      // TODO: Each inner balance fetcher should have their method name aligned,
      // and it should return a `Token` type.
      return wrapper.getBalances(owner);
    }))).reduce((acc,tokens) => {
      acc = acc.concat(tokens);
      return acc;
    }, []);
  }

}