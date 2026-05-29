import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { PrismaModule } from './prisma/prisma.module'
import { DataModule } from './data/data.module'
import { ApiKeyGuard } from './common/api-key.guard'
import { AppController } from './app.controller'

@Module({
  imports: [PrismaModule, DataModule],
  controllers: [AppController],
  // Protège toutes les routes par clé d'API (sauf @Public, ex. /health).
  providers: [{ provide: APP_GUARD, useClass: ApiKeyGuard }],
})
export class AppModule {}
