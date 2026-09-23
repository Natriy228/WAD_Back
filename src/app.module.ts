import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WavesController } from './app.controller';
import { WavesService } from './app.service';

import { User } from './entities/user.entity'
import { Wave } from './entities/wave.entity'
import { MLike } from './entities/like.entity'

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),
            TypeOrmModule.forRootAsync({
              imports: [ConfigModule],
              inject: [ConfigService],
              useFactory: (config: ConfigService) => ({
                type: 'postgres',
                host: config.get('DB_HOST', 'localhost'),
                port: config.get('DB_PORT', 5432),
                username: config.get('DB_USERNAME'),
                password: config.get('DB_PASSWORD'),
                database: config.get('DB_DATABASE'),
                autoLoadEntities: true,
                synchronize: false,
              })
            }),
            TypeOrmModule.forFeature([User, Wave, MLike])
  ],
  controllers: [WavesController],
  providers: [WavesService],
})
export class AppModule {}
