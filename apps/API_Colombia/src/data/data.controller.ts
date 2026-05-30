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
} from '@nestjs/common'
import { DataService } from './data.service'
import {
  CreateExploitationDto,
  UpdateExploitationDto,
} from './dto/exploitation.dto'

/**
 * Endpoints protégés par la clé d'API (voir ApiKeyGuard).
 * Consommés par l'API_Siege : lecture des données + CRUD des exploitations.
 */
@Controller()
export class DataController {
  constructor(private readonly data: DataService) {}

  @Get('exploitations')
  exploitations() {
    return this.data.exploitations()
  }

  @Post('exploitations')
  createExploitation(@Body() dto: CreateExploitationDto) {
    return this.data.createExploitation(dto.nom)
  }

  @Patch('exploitations/:id')
  updateExploitation(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExploitationDto,
  ) {
    return this.data.updateExploitation(id, dto.nom)
  }

  @Delete('exploitations/:id')
  deleteExploitation(@Param('id', ParseIntPipe) id: number) {
    return this.data.deleteExploitation(id)
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
