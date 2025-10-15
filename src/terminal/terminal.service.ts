import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Terminal } from './terminal.entity';
import { TerminalAssignment } from './terminal-assignment.entity';
import { User, UserRole } from '../user/user.entity';
import { CreateTerminalDto, UpdateTerminalDto, AssignTerminalDto, UnassignTerminalDto } from './dto/terminal.dto';

@Injectable()
export class TerminalService {
  constructor(
    @InjectRepository(Terminal)
    private readonly terminalRepo: Repository<Terminal>,
    @InjectRepository(TerminalAssignment)
    private readonly assignmentRepo: Repository<TerminalAssignment>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(createTerminalDto: CreateTerminalDto): Promise<Terminal> {
    // Check if terminal with same terminalNumber already exists
    const existingTerminal = await this.terminalRepo.findOne({
      where: { terminalNumber: createTerminalDto.terminalNumber }
    });

    if (existingTerminal) {
      throw new BadRequestException('Terminal with this number already exists');
    }

    const terminal = this.terminalRepo.create(createTerminalDto);
    return this.terminalRepo.save(terminal);
  }

  async findAll(): Promise<Terminal[]> {
    return this.terminalRepo.find();
  }

  async findOne(id: number): Promise<Terminal> {
    const terminal = await this.terminalRepo.findOne({
      where: { id }
    });

    if (!terminal) {
      throw new NotFoundException(`Terminal with ID ${id} not found`);
    }

    return terminal;
  }

  async findByTerminalNumber(terminalNumber: string): Promise<Terminal> {
    const terminal = await this.terminalRepo.findOne({
      where: { terminalNumber }
    });

    if (!terminal) {
      throw new NotFoundException(`Terminal with number ${terminalNumber} not found`);
    }

    return terminal;
  }

  async update(id: number, updateTerminalDto: UpdateTerminalDto): Promise<Terminal> {
    const terminal = await this.findOne(id);
    
    // Check if terminalNumber conflicts with existing terminals
    if (updateTerminalDto.terminalNumber) {
      const existingTerminal = await this.terminalRepo.findOne({
        where: { terminalNumber: updateTerminalDto.terminalNumber }
      });

      if (existingTerminal && existingTerminal.id !== id) {
        throw new BadRequestException('Terminal with this number already exists');
      }
    }

    Object.assign(terminal, updateTerminalDto);
    return this.terminalRepo.save(terminal);
  }

  async remove(id: number): Promise<void> {
    const terminal = await this.findOne(id);
    
    // If terminal is assigned to a user, unassign it first
    if (terminal.assignedUserId) {
      await this.unassignTerminal({ terminalId: id });
    }

    await this.terminalRepo.remove(terminal);
  }

  async assignTerminal(assignTerminalDto: AssignTerminalDto): Promise<TerminalAssignment> {
    const { userId, terminalId, shopName, streetAddress, postalCode, stateRegion, email, phoneNumber, gpsCoordinates, macAddress } = assignTerminalDto;

    // Check if user exists
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if terminal exists
    const terminal = await this.findOne(terminalId);

    // Check if terminal is already assigned
    if (terminal.assignedUserId) {
      throw new BadRequestException('Terminal is already assigned to another user');
    }

    // Check if user already has a terminal assigned
    const userWithTerminal = await this.userRepo.findOne({
      where: { assignedTerminalId: terminalId }
    });
    if (userWithTerminal) {
      throw new BadRequestException('User already has a terminal assigned');
    }

    // Check if MAC address is already used in any assignment
    const existingMacAssignment = await this.assignmentRepo.findOne({
      where: { macAddress, isActive: true }
    });
    if (existingMacAssignment) {
      throw new BadRequestException('MAC address is already in use by another terminal assignment');
    }

    // Create terminal assignment with business details
    const assignment = this.assignmentRepo.create({
      terminalId,
      userId,
      shopName,
      streetAddress,
      postalCode,
      stateRegion,
      email,
      phoneNumber,
      gpsCoordinates,
      macAddress,
      isActive: true
    });

    const savedAssignment = await this.assignmentRepo.save(assignment);

    // Update terminal assignment
    terminal.assignedUserId = userId;
    await this.terminalRepo.save(terminal);

    // Update user role to PUP_ADMIN and assign terminal
    user.role = UserRole.PUP_ADMIN;
    user.assignedTerminalId = terminalId;
    await this.userRepo.save(user);

    return savedAssignment;
  }

  async unassignTerminal(unassignTerminalDto: UnassignTerminalDto): Promise<Terminal> {
    const { terminalId } = unassignTerminalDto;

    const terminal = await this.findOne(terminalId);

    if (!terminal.assignedUserId) {
      throw new BadRequestException('Terminal is not assigned to any user');
    }

    // Find the active assignment
    const assignment = await this.assignmentRepo.findOne({
      where: { terminalId, isActive: true }
    });

    if (assignment) {
      // Deactivate the assignment
      assignment.isActive = false;
      await this.assignmentRepo.save(assignment);
    }

    // Find the assigned user
    const user = await this.userRepo.findOne({
      where: { id: terminal.assignedUserId }
    });

    if (user) {
      // Revert user role to USER and remove terminal assignment
      user.role = UserRole.USER;
      user.assignedTerminalId = null;
      await this.userRepo.save(user);
    }

    // Remove terminal assignment
    terminal.assignedUserId = null;
    await this.terminalRepo.save(terminal);

    return this.findOne(terminalId);
  }

  async getAssignedUsers(): Promise<User[]> {
    return this.userRepo.find({
      where: { role: UserRole.PUP_ADMIN }
    });
  }

  async getTerminalsByUser(userId: number): Promise<Terminal[]> {
    return this.terminalRepo.find({
      where: { assignedUserId: userId }
    });
  }

  async getAssignmentDetails(terminalId: number): Promise<TerminalAssignment> {
    const assignment = await this.assignmentRepo.findOne({
      where: { terminalId, isActive: true },
      relations: ['terminal', 'user']
    });

    if (!assignment) {
      throw new NotFoundException('No active assignment found for this terminal');
    }

    return assignment;
  }

  async getAssignmentByUser(userId: number): Promise<TerminalAssignment> {
    const assignment = await this.assignmentRepo.findOne({
      where: { userId, isActive: true },
      relations: ['terminal', 'user']
    });

    if (!assignment) {
      throw new NotFoundException('No active assignment found for this user');
    }

    return assignment;
  }

  async getAllAssignments(): Promise<TerminalAssignment[]> {
    return this.assignmentRepo.find({
      where: { isActive: true },
      relations: ['terminal', 'user']
    });
  }
}
