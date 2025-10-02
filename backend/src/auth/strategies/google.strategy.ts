import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL');
    
    console.log('Google OAuth Configuration:');
    console.log('Client ID:', clientID ? 'Set' : 'Missing');
    console.log('Client Secret:', clientSecret ? 'Set' : 'Missing');
    console.log('Callback URL:', callbackURL);
    
    if (!clientID || !clientSecret || !callbackURL) {
      console.error('❌ Google OAuth configuration is incomplete!');
      console.error('Please check your environment variables:');
      console.error('- GOOGLE_CLIENT_ID');
      console.error('- GOOGLE_CLIENT_SECRET');
      console.error('- GOOGLE_CALLBACK_URL');
    }
    
    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;
    
    // Safely extract name with fallbacks
    let fullName = '';
    if (name) {
      if (name.givenName && name.familyName) {
        fullName = `${name.givenName} ${name.familyName}`;
      } else if (name.givenName) {
        fullName = name.givenName;
      } else if (name.familyName) {
        fullName = name.familyName;
      } else if (name.displayName) {
        fullName = name.displayName;
      }
    }
    
    // Fallback to email username if no name is available
    if (!fullName && emails && emails[0]) {
      fullName = emails[0].value.split('@')[0];
    }
    
    // Final fallback
    if (!fullName) {
      fullName = 'Google User';
    }
    
    const user = {
      googleId: id,
      email: emails?.[0]?.value || '',
      name: fullName,
      avatar: photos?.[0]?.value,
      provider: 'google',
    };

    const validatedUser = await this.authService.validateOAuthUser(user);
    done(null, validatedUser);
  }
}
