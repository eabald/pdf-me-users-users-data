import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { CreateUserDto } from '@pdf-me/shared';
import { ResetPasswordDto } from './dto/resetPassword.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern({ cmd: 'users-create' })
  async create(@Payload() payload: CreateUserDto) {
    return this.usersService.create(payload);
  }

  @MessagePattern({ cmd: 'users-get-by-email' })
  async getByEmail(@Payload() payload: string) {
    return this.usersService.getByEmail(payload);
  }

  @MessagePattern({ cmd: 'users-get-by-id' })
  async getById(@Payload() payload: number) {
    return this.usersService.getById(payload);
  }

  @MessagePattern({ cmd: 'users-set-resetting-password' })
  async setResettingPassword(@Payload() payload: string) {
    return this.usersService.setResettingPassword(payload);
  }

  @MessagePattern({ cmd: 'users-update-password' })
  async updatePassword(@Payload() payload: ResetPasswordDto) {
    return this.usersService.updatePassword(payload);
  }

  @MessagePattern({ cmd: 'users-confirm-email' })
  async confirmEmail(@Payload() payload: string) {
    return this.usersService.confirmEmail(payload);
  }
}
