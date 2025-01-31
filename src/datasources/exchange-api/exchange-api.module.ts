import { Global, Module } from '@nestjs/common';
import { CacheFirstDataSourceModule } from '@/datasources/cache/cache.first.data.source.module';
import { HttpErrorFactory } from '@/datasources/errors/http-error-factory';
import { ExchangeApi } from '@/datasources/exchange-api/exchange-api.service';
import { IExchangeApi } from '@/domain/interfaces/exchange-api.interface';

@Global()
@Module({
  imports: [CacheFirstDataSourceModule],
  providers: [
    HttpErrorFactory,
    { provide: IExchangeApi, useClass: ExchangeApi },
  ],
  exports: [IExchangeApi],
})
export class ExchangeApiModule {}
