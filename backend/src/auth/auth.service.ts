import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from '../database/schemas/user.schema';

export interface OAuthUser {
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
  provider: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async validateOAuthUser(oauthUser: OAuthUser): Promise<UserDocument> {
    const { email, googleId, provider, name } = oauthUser;
    
    // Validate required fields
    if (!email) {
      throw new Error('Email is required for OAuth user');
    }
    if (!name) {
      throw new Error('Name is required for OAuth user');
    }
    if (!googleId) {
      throw new Error('Google ID is required for OAuth user');
    }
    
    this.logger.log(`Processing OAuth user: ${email}, name: ${name}, googleId: ${googleId}`);
    
    // Try to find existing user by email first
    let user = await this.userModel.findOne({ email });
    
    if (user) {
      // Update existing user with Google OAuth info
      user.googleId = googleId;
      user.provider = provider;
      user.name = name; // Update name in case it changed
      user.avatar = oauthUser.avatar;
      user.lastLoginAt = new Date();
      user.isEmailVerified = true;
      await user.save();
      
      this.logger.log(`Existing user ${email} logged in via ${provider}`);
      return user;
    }

    // Create new user
    const newUser = new this.userModel({
      email: oauthUser.email,
      name: oauthUser.name,
      avatar: oauthUser.avatar,
      isEmailVerified: true,
      lastLoginAt: new Date(),
      provider: oauthUser.provider,
      googleId: oauthUser.googleId,
    });

    try {
      const savedUser = await newUser.save();
      this.logger.log(`New user ${email} created via ${provider}`);
      return savedUser;
    } catch (error) {
      this.logger.error(`Failed to create user ${email}:`, error);
      throw error;
    }
  }

  async validateUser(userId: string): Promise<UserDocument | null> {
    return this.userModel.findById(userId);
  }

  async generateJwtToken(user: UserDocument): Promise<string> {
    const payload = { 
      email: user.email, 
      sub: user._id,
      provider: user.provider 
    };
    return this.jwtService.sign(payload);
  }

  async getUserProfile(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      return null;
    }

    return {
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      provider: user.provider,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: (user as any).createdAt,
    };
  }
}
