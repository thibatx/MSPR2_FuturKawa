import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'

// Les identifiants sont des BIGINT côté base : on les sérialise en nombre
// pour que les réponses JSON soient exploitables (sinon JSON.stringify échoue).
;(BigInt.prototype as any).toJSON = function () {
  return Number(this)
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors({ origin: true, credentials: true })
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  app.setGlobalPrefix('api')

  const port = process.env.PORT ?? 3002
  await app.listen(port)
  console.log(`🇨🇴 API Colombia running on http://localhost:${port}/api`)
}
bootstrap()
