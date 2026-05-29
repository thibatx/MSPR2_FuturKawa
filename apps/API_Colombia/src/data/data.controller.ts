import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common'
import { DataService } from './data.service'

/**
 * Endpoints en lecture seule, protégés par la clé d'API (voir ApiKeyGuard).
 * Consommés par l'API_Siege pour agréger les données des pays.
 */
@Controller()
export class DataController {
  constructor(private readonly data: DataService) {}

  @Get('exploitations')
  exploitations() {
    return this.data.exploitations()
  }

  @Get('entrepots')
  entrepots() {
    return this.data.entrepots()
  }

  @Get('lots')
  lots(@Query('entrepotId', new ParseIntPipe({ optional: true })) entrepotId?: number) {
    return this.data.lots(entrepotId)
  }

  @Get('mesures')
  mesures(@Query('entrepotId', new ParseIntPipe({ optional: true })) entrepotId?: number) {
    return this.data.mesures(entrepotId)
  }
}
