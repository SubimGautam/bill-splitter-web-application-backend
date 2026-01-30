import bcrypt from "bcryptjs";
import { UserRepository } from "../repositories/user.repository";
import { generateToken } from "../utils/jwt";

// ✅ Make sure this is instantiated correctly
const userRepo = new UserRepository();

export class AuthService {
  async register(username: string, email: string, password: string) {
    console.log("🔍 AuthService.register called");
    console.log(`   - Username: ${username}`);
    console.log(`   - Email: ${email}`);
    
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    
    console.log(`🔍 Checking if user exists: ${normalizedEmail}`);
    
    // ✅ This should work if findByEmail is properly implemented
    const existingUser = await userRepo.findByEmail(normalizedEmail);
    
    if (existingUser) {
      console.log(`❌ User already exists: ${normalizedEmail}`);
      throw new Error("Email already exists");
    }

    console.log(`🔍 Hashing password...`);
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`🔍 Creating user in database...`);
    const user = await userRepo.create({
      username: username.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    console.log(`✅ User created successfully: ${user._id}`);
    
    const token = generateToken({
      userId: user._id,
      role: user.role || 'user',
    });

    console.log(`🔑 Token generated for user: ${user._id}`);

    return { 
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role || 'user'
      }
    };
  }

  async login(email: string, password: string) {
    console.log("🔍 AuthService.login called");
    console.log(`   - Email: ${email}`);
    
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    
    console.log(`🔍 Finding user by email: ${normalizedEmail}`);
    
    // ✅ This is where the error happens
    const user = await userRepo.findByEmail(normalizedEmail);
    
    if (!user) {
      console.log(`❌ No user found with email: ${normalizedEmail}`);
      throw new Error("Invalid credentials");
    }

    console.log(`✅ User found: ${user.email}`);
    console.log(`🔍 Comparing passwords...`);
    
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log(`❌ Password mismatch for: ${normalizedEmail}`);
      throw new Error("Invalid credentials");
    }

    console.log(`✅ Login successful for: ${normalizedEmail}`);
    
    const token = generateToken({
      userId: user._id,
      role: user.role || 'user',
    });

    console.log(`🔑 Token generated: ${token.substring(0, 20)}...`);

    return { 
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role || 'user'
      }
    };
  }
}