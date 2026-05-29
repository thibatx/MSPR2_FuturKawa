import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { CountriesModule } from './countries/countries.module'
import { RolesGuard } from './auth/roles.guard'
import { AppController } from './app.controller'

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, CountriesModule],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: RolesGuard }],
})
export class AppModule {}
