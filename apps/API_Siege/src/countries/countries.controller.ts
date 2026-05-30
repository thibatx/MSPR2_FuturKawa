import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { CountriesService } from './countries.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { AdminGuard } from '../auth/admin.guard'
import {
  CreateExploitationDto,
  UpdateExploitationDto,
} from './dto/exploitation.dto'

/**
 * Agrégation des données des pays, côté Siège.
 * Chaîne de sécurité : navigateur --(JWT)--> API_Siege --(x-api-key)--> API pays.
 * L'utilisateur doit être authentifié (JwtAuthGuard) ; le Siège ajoute ensuite
 * la clé d'API lors de l'appel sortant vers le pays.
 * Les écritures (CRUD exploitations) exigent en plus le rôle ADMIN.
 */
@Controller('countries')
@UseGuards(JwtAuthGuard)
export class CountriesController {
  constructor(private readonly countries: CountriesService) {}

  @Get(':country/exploitations')
  exploitations(@Param('country') country: string) {
    return this.countries.exploitations(country)
  }

  @Post(':country/exploitations')
  @UseGuards(AdminGuard)
  createExploitation(
    @Param('country') country: string,
    @Body() dto: CreateExploitationDto,
  ) {
    return this.countries.createExploitation(country, dto.nom)
  }

  @Patch(':country/exploitations/:id')
  @UseGuards(AdminGuard)
  updateExploitation(
    @Param('country') country: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExploitationDto,
  ) {
    return this.countries.updateExploitation(country, id, dto.nom)
  }

  @Delete(':country/exploitations/:id')
  @UseGuards(AdminGuard)
  deleteExploitation(
    @Param('country') country: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.countries.deleteExploitation(country, id)
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
