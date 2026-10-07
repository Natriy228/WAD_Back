import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WavesController, UsersController } from './waves.controller';
import { WavesService } from './waves.service';
import { TypeORMWavesRepository } from './repositories/typeorm-waves.repository';
import { TypeORMLikesRepository } from './repositories/typeorm-likes.repository';
import { TypeORMUsersRepository } from './repositories/typeorm-users.repository';
import { MinioSimpleService } from './minio.service';

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
  controllers: [WavesController, UsersController],
  providers: [WavesService, TypeORMWavesRepository, TypeORMLikesRepository, TypeORMUsersRepository, MinioSimpleService],
  exports: [WavesService]
})
export class AppModule {}
