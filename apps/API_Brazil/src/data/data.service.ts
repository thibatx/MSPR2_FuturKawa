import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

/**
 * Accès en lecture seule aux données du pays.
 * Les pays remontent leurs données ; le pilotage/écriture reste au Siège.
 */
@Injectable()
export class DataService {
  constructor(private readonly prisma: PrismaService) {}

  exploitations() {
    return this.prisma.exploitation.findMany({
      orderBy: { id: 'asc' },
      include: { entrepots: true },
    })
  }

  entrepots() {
    return this.prisma.entrepot.findMany({ orderBy: { id: 'asc' } })
  }

  lots(entrepotId?: number) {
    return this.prisma.lot.findMany({
      where: entrepotId ? { idEntrepot: BigInt(entrepotId) } : undefined,
      orderBy: { dateStockage: 'desc' },
    })
  }

  mesures(entrepotId?: number) {
    return this.prisma.mesure.findMany({
      where: entrepotId ? { idEntrepot: BigInt(entrepotId) } : undefined,
      orderBy: { timestamp: 'desc' },
      take: 500,
    })
  }
}
