import { IUser } from "../../modules/user/domain/user.interface";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export {};
