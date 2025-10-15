import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { TerminalStatus } from '../terminal.entity';

export class CreateTerminalDto {
  @IsString()
  terminalNumber: string;

  @IsOptional()
  @IsEnum(TerminalStatus)
  status?: TerminalStatus;
}

export class UpdateTerminalDto {
  @IsOptional()
  @IsString()
  terminalNumber?: string;

  @IsOptional()
  @IsEnum(TerminalStatus)
  status?: TerminalStatus;
}

export class AssignTerminalDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  terminalId: number;

  @IsString()
  shopName: string; // Name of shop

  @IsString()
  streetAddress: string; // Street address

  @IsString()
  postalCode: string; // Postal Code

  @IsString()
  stateRegion: string; // State/Region

  @IsString()
  email: string; // Email

  @IsString()
  phoneNumber: string; // Phone number

  @IsOptional()
  @IsString()
  gpsCoordinates?: string; // GPS Coordinates

  @IsString()
  macAddress: string; // Terminal MAC address
}

export class UnassignTerminalDto {
  @IsNumber()
  terminalId: number;
}
