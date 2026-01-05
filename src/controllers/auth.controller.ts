import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { RegisterDto } from "../dtos/register.dto";
import { LoginDto } from "../dtos/login.dto";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const data = RegisterDto.parse(req.body);

      const result = await authService.register(
        data.username,
        data.email,
        data.password
      );

      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const data = LoginDto.parse(req.body);
      const result = await authService.login(data.email, data.password);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }
}
