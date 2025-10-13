import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { AuthProvider } from '../../user/user.entity';

export class SignUpDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class SignInDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}

export class VerifyEmailDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  code: string;
}

export class ResendVerificationDto {
  @IsEmail()
  email: string;
}

export class GoogleAuthDto {
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  redirectUri?: string;
}

export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    provider: string;
    avatar?: string;
    isEmailVerified: boolean;
  };
}

export class TokenPayload {
  sub: number;
  email: string;
  role: string;
  type: 'access' | 'refresh';
}
