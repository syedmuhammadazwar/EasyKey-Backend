import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { LockerService } from './locker.service';
import { CreateLockerDto, UpdateLockerDto, PurchaseLockerDto, AssignLockersToTerminalDto } from './dto/locker.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../user/user.entity';

@Controller('lockers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LockerController {
  constructor(private readonly lockerService: LockerService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createLockerDto: CreateLockerDto) {
    return this.lockerService.create(createLockerDto);
  }

  @Get()
  findAll(@Query('terminalId') terminalId?: number, @CurrentUser() user?: User) {
    // PUP Admin can only see lockers in their assigned terminal
    if (user.role === UserRole.PUP_ADMIN && user.assignedTerminalId) {
      return this.lockerService.findAll(user.assignedTerminalId);
    }
    return this.lockerService.findAll(terminalId);
  }

  @Get('available')
  getAvailableLockers(@Query('terminalId') terminalId?: number, @CurrentUser() user?: User) {
    // PUP Admin can only see available lockers in their assigned terminal
    if (user.role === UserRole.PUP_ADMIN && user.assignedTerminalId) {
      return this.lockerService.getAvailableLockers(user.assignedTerminalId);
    }
    return this.lockerService.getAvailableLockers(terminalId);
  }

  @Get('my-lockers')
  @Roles(UserRole.USER, UserRole.PUP_ADMIN)
  getMyLockers(@CurrentUser() user: User) {
    return this.lockerService.getPurchasedLockers(user.id);
  }

  @Post('assign-to-terminal')
  @Roles(UserRole.ADMIN, UserRole.PUP_ADMIN)
  assignLockersToTerminal(@Body() dto: AssignLockersToTerminalDto, @CurrentUser() user: User) {
    // PUP Admin can only assign to their terminal
    if (user.role === UserRole.PUP_ADMIN && dto.terminalId !== user.assignedTerminalId) {
      throw new Error('Unauthorized to assign lockers to this terminal');
    }
    return this.lockerService.assignLockersToTerminal(dto);
  }

  @Post('purchase')
  @Roles(UserRole.USER)
  purchaseLocker(@Body() purchaseDto: PurchaseLockerDto, @CurrentUser() user: User) {
    // Users can only purchase for themselves
    return this.lockerService.purchaseLocker({ ...purchaseDto, userId: user.id });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.lockerService.findOne(id);
  }

  @Get('number/:lockerNumber')
  findByLockerNumber(@Param('lockerNumber') lockerNumber: string) {
    return this.lockerService.findByLockerNumber(lockerNumber);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.PUP_ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateLockerDto: UpdateLockerDto, @CurrentUser() user: User) {
    return this.lockerService.update(id, updateLockerDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.lockerService.remove(id);
  }

  // Key endpoints
  @Get(':id/key')
  getKeyByLocker(@Param('id', ParseIntPipe) id: number) {
    return this.lockerService.getKeyByLocker(id);
  }

  @Get('key/:keyCode')
  getKeyByKeyCode(@Param('keyCode') keyCode: string) {
    return this.lockerService.getKeyByKeyCode(keyCode);
  }

  @Patch('key/:id')
  @Roles(UserRole.ADMIN)
  updateKey(@Param('id', ParseIntPipe) id: number, @Body() updateKeyDto: any) {
    return this.lockerService.updateKey(id, updateKeyDto);
  }

  @Patch('key/:id/deactivate')
  @Roles(UserRole.ADMIN)
  deactivateKey(@Param('id', ParseIntPipe) id: number) {
    return this.lockerService.deactivateKey(id);
  }
}
