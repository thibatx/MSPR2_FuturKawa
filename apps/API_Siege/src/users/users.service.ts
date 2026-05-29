import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import type { Role, User } from '../generated/prisma'
import { PrismaService } from '../prisma/prisma.service'
import { CreateUserDto } from './dto/create-user.dto'

const BCRYPT_ROUNDS = 12

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private publicUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    }
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
    })
    return users.map((u) => this.publicUser(u))
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })
    if (existing) throw new ConflictException('Email déjà utilisé')

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS)
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name ?? null,
        passwordHash,
        role: dto.role ?? 'USER',
      },
    })
    return this.publicUser(user)
  }

  async setRole(id: string, role: Role) {
    const existing = await this.prisma.user.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Utilisateur introuvable')

    const user = await this.prisma.user.update({
      where: { id },
      data: { role },
    })
    return this.publicUser(user)
  }

  async remove(id: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new BadRequestException(
        'Vous ne pouvez pas supprimer votre propre compte',
      )
    }

    const existing = await this.prisma.user.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Utilisateur introuvable')

    await this.prisma.user.delete({ where: { id } })
    return { success: true }
  }
}
