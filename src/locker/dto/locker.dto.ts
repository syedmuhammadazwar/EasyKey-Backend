import { IsString, IsOptional, IsEnum, IsNumber, IsDateString, IsArray } from 'class-validator';
import { LockerStatus } from '../locker.entity';
import { KeyStatus } from '../key.entity';

export class CreateLockerDto {
  @IsString()
  lockerNumber: string;

  @IsNumber()
  terminalId: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(LockerStatus)
  status?: LockerStatus;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateLockerDto {
  @IsOptional()
  @IsString()
  lockerNumber?: string;

  @IsOptional()
  @IsNumber()
  terminalId?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(LockerStatus)
  status?: LockerStatus;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class PurchaseLockerDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  lockerId: number;
}

export class CreateKeyDto {
  @IsString()
  keyCode: string;

  @IsNumber()
  lockerId: number;

  @IsOptional()
  @IsEnum(KeyStatus)
  status?: KeyStatus;

  @IsOptional()
  @IsString()
  secretPin?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}

export class UpdateKeyDto {
  @IsOptional()
  @IsEnum(KeyStatus)
  status?: KeyStatus;

  @IsOptional()
  @IsString()
  secretPin?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsDateString()
  lastUsed?: string;
}

export class AssignLockersToTerminalDto {
  @IsNumber()
  terminalId: number;

  @IsArray()
  @IsString({ each: true })
  lockerNumbers: string[]; // Array of locker numbers to create

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  size?: string;
}
