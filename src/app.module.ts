import {
  DynamicModule,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ClsMiddleware, ClsModule } from 'nestjs-cls';
import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';

import { ChainsModule } from '@/routes/chains/chains.module';
import { BalancesModule } from '@/routes/balances/balances.module';
import { NetworkModule } from '@/datasources/network/network.module';
import { ConfigurationModule } from '@/config/configuration.module';
import { CacheModule } from '@/datasources/cache/cache.module';
import { DomainModule } from '@/domain.module';
import { CacheHooksModule } from '@/routes/cache-hooks/cache-hooks.module';
import { CollectiblesModule } from '@/routes/collectibles/collectibles.module';
import { ContractsModule } from '@/routes/contracts/contracts.module';
import { DataDecodedModule } from '@/routes/data-decode/data-decoded.module';
import { DelegatesModule } from '@/routes/delegates/delegates.module';
import { SafeAppsModule } from '@/routes/safe-apps/safe-apps.module';
import { HealthModule } from '@/routes/health/health.module';
import { OwnersModule } from '@/routes/owners/owners.module';
import { AboutModule } from '@/routes/about/about.module';
import { TransactionsModule } from '@/routes/transactions/transactions.module';
import { SafesModule } from '@/routes/safes/safes.module';
import { NotificationsModule } from '@/routes/notifications/notifications.module';
import { EstimationsModule } from '@/routes/estimations/estimations.module';
import { MessagesModule } from '@/routes/messages/messages.module';
import { ValidationModule } from '@/validation/validation.module';
import { FlushModule } from '@/routes/flush/flush.module';
import { RequestScopedLoggingModule } from '@/logging/logging.module';
import { RouteLoggerInterceptor } from '@/routes/common/interceptors/route-logger.interceptor';
import { NotFoundLoggerMiddleware } from '@/middleware/not-found-logger.middleware';
import configuration from '@/config/entities/configuration';
import { GlobalErrorFilter } from '@/routes/common/filters/global-error.filter';
import { DataSourceErrorFilter } from '@/routes/common/filters/data-source-error.filter';
import { ServeStaticModule } from '@nestjs/serve-static';
import { RootModule } from '@/routes/root/root.module';
import { AlertsModule } from '@/routes/alerts/alerts.module';

@Module({})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      // The ClsMiddleware needs to be applied before the LoggerMiddleware
      // in order to generate the request ids that will be logged afterward
      .apply(ClsMiddleware, NotFoundLoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }

  static register(configFactory = configuration): DynamicModule {
    const { features } = configFactory();
    return {
      module: AppModule,
      imports: [
        // features
        ...(features.alerts ? [AlertsModule] : []),
        AboutModule,
        BalancesModule,
        CacheHooksModule,
        ChainsModule,
        CollectiblesModule,
        ContractsModule,
        DataDecodedModule,
        DelegatesModule,
        EstimationsModule,
        FlushModule,
        HealthModule,
        MessagesModule,
        NotificationsModule,
        OwnersModule,
        RootModule,
        SafeAppsModule,
        SafesModule,
        TransactionsModule,
        // common
        CacheModule,
        // Module for storing and reading from the async local storage
        ClsModule.forRoot({
          global: true,
          middleware: {
            generateId: true,
            idGenerator: () => uuidv4(),
          },
        }),
        ConfigurationModule.register(configFactory),
        DomainModule,
        NetworkModule,
        RequestScopedLoggingModule,
        ServeStaticModule.forRoot({
          rootPath: join(__dirname, '..', 'assets'),
          // Excludes the paths under '/' (base url) from being served as static content
          // If we do not exclude these paths, the service will try to find the file and
          // return 500 for files that do not exist instead of a 404
          exclude: ['/(.*)'],
        }),
        ValidationModule,
      ],
      providers: [
        {
          provide: APP_INTERCEPTOR,
          useClass: RouteLoggerInterceptor,
        },
        {
          provide: APP_FILTER,
          useClass: GlobalErrorFilter,
        },
        {
          provide: APP_FILTER,
          useClass: DataSourceErrorFilter,
        },
      ],
    };
  }
}
