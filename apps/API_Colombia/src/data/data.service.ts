import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

/**
 * Accès aux données du pays.
 * La lecture est ouverte à l'API_Siege ; les écritures (CRUD exploitations)
 * sont pilotées par le Siège et restreintes aux administrateurs en amont.
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

  createExploitation(nom: string) {
    return this.prisma.exploitation.create({
      data: { nom },
      include: { entrepots: true },
    })
  }

  async updateExploitation(id: number, nom: string) {
    await this.ensureExploitation(id)
    return this.prisma.exploitation.update({
      where: { id: BigInt(id) },
      data: { nom },
      include: { entrepots: true },
    })
  }

  async deleteExploitation(id: number) {
    await this.ensureExploitation(id)
    await this.prisma.exploitation.delete({ where: { id: BigInt(id) } })
    return { success: true }
  }

  private async ensureExploitation(id: number) {
    const found = await this.prisma.exploitation.findUnique({
      where: { id: BigInt(id) },
    })
    if (!found) {
      throw new NotFoundException(`Exploitation ${id} introuvable`)
    }
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
