import bcrypt from "bcryptjs";
import { UserRepository } from "../repositories/user.repository";
import { generateToken } from "../utils/jwt";

const userRepo = new UserRepository();

export class AuthService {
  async register(username: string, email: string, password: string) {
    const existingUser = await userRepo.findByEmail(email);
    if (existingUser) throw new Error("Email already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userRepo.create({
      username,
      email,
      password: hashedPassword,
    });

    const token = generateToken({
      userId: user._id,
      role: user.role,
    });

    return { token };
  }

  async login(email: string, password: string) {
    const user = await userRepo.findByEmail(email);
    if (!user) throw new Error("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    const token = generateToken({
      userId: user._id,
      role: user.role,
    });

    return { token };
  }
}

