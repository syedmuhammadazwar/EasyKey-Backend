import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { User, AuthProvider } from '../user/user.entity';
import { RefreshToken } from './refresh-token.entity';
import { SignUpDto, SignInDto, AuthResponseDto, TokenPayload, VerifyEmailDto, ResendVerificationDto } from './dto/auth.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<{ message: string; email: string }> {
    const { name, email, password } = signUpDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate email verification code (6 digits)
    const emailVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const user = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      provider: AuthProvider.LOCAL,
      emailVerificationCode,
      emailVerificationExpires,
      isEmailVerified: false,
    });

    const savedUser = await this.userRepository.save(user);

    // Send verification email
    await this.emailService.sendVerificationCode(email, emailVerificationCode, name);

    return {
      message: 'Registration successful! Please check your email for verification code.',
      email: email,
    };
  }

  async signIn(signInDto: SignInDto): Promise<AuthResponseDto> {
    const { email, password } = signInDto;

    // Find user
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email before signing in');
    }

    // Verify password for local auth
    if (user.provider === AuthProvider.LOCAL) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
    } else {
      throw new UnauthorizedException('Please use the correct sign-in method');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthResponseDto> {
    // Find refresh token
    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken, isRevoked: false },
      relations: ['user'],
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Check if user is still active
    if (!tokenRecord.user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Revoke old refresh token
    tokenRecord.isRevoked = true;
    await this.refreshTokenRepository.save(tokenRecord);

    // Generate new tokens
    const tokens = await this.generateTokens(tokenRecord.user);

    return {
      ...tokens,
      user: this.sanitizeUser(tokenRecord.user),
    };
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
    });

    if (tokenRecord) {
      tokenRecord.isRevoked = true;
      await this.refreshTokenRepository.save(tokenRecord);
    }
  }

  async logoutAll(userId: number): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true },
    );
  }

  async validateUser(payload: TokenPayload): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: payload.sub } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return user;
  }

  async findOrCreateGoogleUser(googleProfile: any): Promise<User> {
    const { id: googleId, emails, displayName, photos } = googleProfile;
    const email = emails[0].value;

    // Check if user exists with this email
    let user = await this.userRepository.findOne({ where: { email } });

    if (user) {
      // Update existing user with Google ID if not already set
      if (!user.googleId) {
        user.googleId = googleId;
        user.provider = AuthProvider.GOOGLE;
        user.avatar = photos[0]?.value;
        user.isEmailVerified = true;
        user = await this.userRepository.save(user);
      }
    } else {
      // Create new user
      user = this.userRepository.create({
        name: displayName,
        email,
        googleId,
        provider: AuthProvider.GOOGLE,
        avatar: photos[0]?.value,
        isEmailVerified: true,
      });
      user = await this.userRepository.save(user);
    }

    return user;
  }

  async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    };

    const refreshPayload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'refresh',
    };

    const [accessToken, refreshTokenValue] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    // Save refresh token to database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const refreshTokenRecord = this.refreshTokenRepository.create({
      token: refreshTokenValue,
      userId: user.id,
      expiresAt,
    });

    await this.refreshTokenRepository.save(refreshTokenRecord);

    return {
      accessToken,
      refreshToken: refreshTokenValue,
    };
  }

  private sanitizeUser(user: User): any {
    const { 
      password, 
      emailVerificationToken, 
      emailVerificationCode, 
      emailVerificationExpires,
      passwordResetToken, 
      passwordResetExpires, 
      ...sanitized 
    } = user;
    return sanitized;
  }

  async revokeAllUserTokens(userId: number): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true },
    );
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<AuthResponseDto> {
    const { email, code } = verifyEmailDto;

    // Find user
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if already verified
    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Check if verification code matches
    if (user.emailVerificationCode !== code) {
      throw new BadRequestException('Invalid verification code');
    }

    // Check if code is expired
    if (!user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
      throw new BadRequestException('Verification code has expired');
    }

    // Update user as verified
    user.isEmailVerified = true;
    user.emailVerificationCode = null;
    user.emailVerificationExpires = null;
    await this.userRepository.save(user);

    // Send welcome email
    await this.emailService.sendWelcomeEmail(email, user.name);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async resendVerificationCode(resendDto: ResendVerificationDto): Promise<{ message: string }> {
    const { email } = resendDto;

    // Find user
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if already verified
    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Generate new verification code
    const emailVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with new code
    user.emailVerificationCode = emailVerificationCode;
    user.emailVerificationExpires = emailVerificationExpires;
    await this.userRepository.save(user);

    // Send verification email
    await this.emailService.sendVerificationCode(email, emailVerificationCode, user.name);

    return {
      message: 'Verification code sent to your email',
    };
  }

  async exchangeGoogleToken(googleAccessToken: string): Promise<AuthResponseDto> {
    try {
      // Verify the Google access token and get user info
      const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${googleAccessToken}`);
      
      if (!response.ok) {
        throw new UnauthorizedException('Invalid Google access token');
      }
      
      const googleUser = await response.json();
      
      if (!googleUser.email) {
        throw new UnauthorizedException('Invalid Google user data');
      }
      
      // Find or create user
      const user = await this.findOrCreateGoogleUser(googleUser);
      
      // Generate tokens
      const tokens = await this.generateTokens(user);
      
      return {
        ...tokens,
        user: this.sanitizeUser(user),
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Google authentication failed');
    }
  }
}
