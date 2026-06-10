export interface IUser {
  id: number;
  username: string;
  usercode: string;
  email: string;
  password: string;
  avatar: string;
  EVMAddress: string;
  SOLAddress: string;
  BTCAddress: string;
  EVMPrivatekey: string;//risk secure
  SOLPrivatekey: string;
  BTCPrivatekey: string;
  ethBalance: BigInt;
  usdtBalance: BigInt;
  btcBalance: BigInt;
  solBalance: BigInt;
}