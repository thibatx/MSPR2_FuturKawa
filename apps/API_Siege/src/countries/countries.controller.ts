import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common'
import { CountriesService } from './countries.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

/**
 * Agrégation des données des pays, côté Siège.
 * Chaîne de sécurité : navigateur --(JWT)--> API_Siege --(x-api-key)--> API pays.
 * L'utilisateur doit être authentifié (JwtAuthGuard) ; le Siège ajoute ensuite
 * la clé d'API lors de l'appel sortant vers le pays.
 */
@Controller('countries')
@UseGuards(JwtAuthGuard)
export class CountriesController {
  constructor(private readonly countries: CountriesService) {}

  @Get(':country/exploitations')
  exploitations(@Param('country') country: string) {
    return this.countries.exploitations(country)
  }

  @Get(':country/entrepots')
  entrepots(@Param('country') country: string) {
    return this.countries.entrepots(country)
  }

  @Get(':country/lots')
  lots(
    @Param('country') country: string,
    @Query('entrepotId', new ParseIntPipe({ optional: true })) entrepotId?: number,
  ) {
    return this.countries.lots(country, entrepotId)
  }

  @Get(':country/mesures')
  mesures(
    @Param('country') country: string,
    @Query('entrepotId', new ParseIntPipe({ optional: true })) entrepotId?: number,
  ) {
    return this.countries.mesures(country, entrepotId)
  }
}
