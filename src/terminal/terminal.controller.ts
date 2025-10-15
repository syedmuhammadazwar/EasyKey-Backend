import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  ParseIntPipe 
} from '@nestjs/common';
import { TerminalService } from './terminal.service';
import { CreateTerminalDto, UpdateTerminalDto, AssignTerminalDto, UnassignTerminalDto } from './dto/terminal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../user/user.entity';

@Controller('terminals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TerminalController {
  constructor(private readonly terminalService: TerminalService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createTerminalDto: CreateTerminalDto) {
    return this.terminalService.create(createTerminalDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.PUP_ADMIN)
  findAll(@CurrentUser() user: User) {
    // PUP_ADMIN can only see their assigned terminal
    if (user.role === UserRole.PUP_ADMIN) {
      return this.terminalService.getTerminalsByUser(user.id);
    }
    // ADMIN can see all terminals
    return this.terminalService.findAll();
  }

  @Get('assigned-users')
  @Roles(UserRole.ADMIN)
  getAssignedUsers() {
    return this.terminalService.getAssignedUsers();
  }

  @Get('assignments')
  @Roles(UserRole.ADMIN)
  getAllAssignments() {
    return this.terminalService.getAllAssignments();
  }

  @Get('assignments/:terminalId')
  @Roles(UserRole.ADMIN, UserRole.PUP_ADMIN)
  getAssignmentDetails(@Param('terminalId', ParseIntPipe) terminalId: number, @CurrentUser() user: User) {
    // PUP_ADMIN can only access their own assignment
    if (user.role === UserRole.PUP_ADMIN && user.assignedTerminalId !== terminalId) {
      throw new Error('Unauthorized to access this assignment');
    }
    return this.terminalService.getAssignmentDetails(terminalId);
  }

  @Get('my-assignment')
  @Roles(UserRole.PUP_ADMIN)
  getMyAssignment(@CurrentUser() user: User) {
    return this.terminalService.getAssignmentByUser(user.id);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.PUP_ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    // PUP_ADMIN can only access their assigned terminal
    if (user.role === UserRole.PUP_ADMIN && user.assignedTerminalId !== id) {
      throw new Error('Unauthorized to access this terminal');
    }
    return this.terminalService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTerminalDto: UpdateTerminalDto) {
    return this.terminalService.update(id, updateTerminalDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.terminalService.remove(id);
  }

  @Post('assign')
  @Roles(UserRole.ADMIN)
  assignTerminal(@Body() assignTerminalDto: AssignTerminalDto) {
    return this.terminalService.assignTerminal(assignTerminalDto);
  }

  @Post('unassign')
  @Roles(UserRole.ADMIN)
  unassignTerminal(@Body() unassignTerminalDto: UnassignTerminalDto) {
    return this.terminalService.unassignTerminal(unassignTerminalDto);
  }
}
