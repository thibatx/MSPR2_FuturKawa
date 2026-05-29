import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateRoleDto } from './dto/update-role.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { AdminGuard } from '../auth/admin.guard'
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator'

/**
 * Gestion des utilisateurs — réservée aux administrateurs.
 * JwtAuthGuard authentifie (renseigne req.user), AdminGuard exige le rôle ADMIN.
 */
@Controller('users')
@UseGuards(JwtAuthGuard, AdminGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll()
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto)
  }

  @Patch(':id/role')
  setRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.usersService.setRole(id, dto.role)
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() current: AuthUser) {
    return this.usersService.remove(id, current.id)
  }
}
