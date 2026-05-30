import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common'

type CountryKey = 'colombia' | 'brazil'

type CountryConfig = {
  baseUrl: string
  apiKey: string
}

/**
 * Client sécurisé vers les API des pays.
 * La communication est authentifiée par une clé partagée (en-tête x-api-key) :
 * seules l'API_Siege (qui détient la clé) peut interroger les données des pays.
 */
@Injectable()
export class CountriesService {
  private readonly registry: Record<CountryKey, CountryConfig> = {
    colombia: {
      baseUrl: process.env.COLOMBIA_API_URL ?? 'http://localhost:3002/api',
      apiKey: process.env.COLOMBIA_API_KEY ?? '',
    },
    brazil: {
      baseUrl: process.env.BRAZIL_API_URL ?? 'http://localhost:3003/api',
      apiKey: process.env.BRAZIL_API_KEY ?? '',
    },
  }

  private resolve(country: string): CountryConfig {
    const key = country?.toLowerCase() as CountryKey
    const config = this.registry[key]
    if (!config) {
      throw new BadRequestException(
        `Pays inconnu : « ${country} » (attendu : colombia | brazil)`,
      )
    }
    return config
  }

  /** Appel GET authentifié vers l'API d'un pays. */
  async fetch<T>(
    country: string,
    path: string,
    query?: Record<string, string | number | undefined>,
  ): Promise<T> {
    const { baseUrl, apiKey } = this.resolve(country)

    const url = new URL(`${baseUrl}${path}`)
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
      }
    }

    let res: Response
    try {
      res = await fetch(url, { headers: { 'x-api-key': apiKey } })
    } catch (e) {
      throw new BadGatewayException(
        `API ${country} injoignable (${(e as Error).message})`,
      )
    }

    if (!res.ok) {
      throw new BadGatewayException(
        `API ${country} a répondu ${res.status} sur ${path}`,
      )
    }
    return res.json() as Promise<T>
  }

  /** Appel d'écriture (POST/PATCH/DELETE) authentifié vers l'API d'un pays. */
  async send<T>(
    country: string,
    path: string,
    method: 'POST' | 'PATCH' | 'DELETE',
    body?: unknown,
  ): Promise<T> {
    const { baseUrl, apiKey } = this.resolve(country)

    let res: Response
    try {
      res = await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
          'x-api-key': apiKey,
          ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      })
    } catch (e) {
      throw new BadGatewayException(
        `API ${country} injoignable (${(e as Error).message})`,
      )
    }

    if (!res.ok) {
      throw new BadGatewayException(
        `API ${country} a répondu ${res.status} sur ${path}`,
      )
    }
    return res.json() as Promise<T>
  }

  exploitations(country: string) {
    return this.fetch(country, '/exploitations')
  }

  createExploitation(country: string, nom: string) {
    return this.send(country, '/exploitations', 'POST', { nom })
  }

  updateExploitation(country: string, id: number, nom: string) {
    return this.send(country, `/exploitations/${id}`, 'PATCH', { nom })
  }

  deleteExploitation(country: string, id: number) {
    return this.send(country, `/exploitations/${id}`, 'DELETE')
  }

  entrepots(country: string) {
    return this.fetch(country, '/entrepots')
  }

  lots(country: string, entrepotId?: number) {
    return this.fetch(country, '/lots', { entrepotId })
  }

  mesures(country: string, entrepotId?: number) {
    return this.fetch(country, '/mesures', { entrepotId })
  }
}
