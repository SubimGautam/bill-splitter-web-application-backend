import User from "../models/user.model";

export class UserRepository {
  findByEmail(email: string) {
    return User.findOne({ email });
  }

  create(data: any) {
    return User.create(data);
  }
}
