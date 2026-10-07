import { Controller, Get, Post, Body, Param, Query, Put, Delete, UseInterceptors, UploadedFile, ParseIntPipe, BadRequestException, } from '@nestjs/common';
import { WavesService } from './waves.service';

import { WaveResponseDto } from './dto/wave-response.dto';
import { CreateWaveDto } from './dto/create-wave.dto';
import { WaveFiltersDto } from './dto/wave-filters.dto';

import { RegisterUserDto } from './dto/user-register.dto';

import { memoryStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('waves')
export class WavesController {
  constructor(private readonly wavesService: WavesService) {}

  @Get()
  async getAllWaves(@Query() filters: WaveFiltersDto): Promise<WaveResponseDto[]> {
    return this.wavesService.findAll(filters);
  }

  @Get('draft')
  async getDraft(): Promise<WaveResponseDto> {
    return this.wavesService.findDraft();
  }

  @Get(':id')
  async getWaveById(@Param('id', ParseIntPipe) id: number, @Query('next') next: boolean): Promise<WaveResponseDto> {
    if (next != undefined) {
      return this.wavesService.findById(id + 1);
    }
    return this.wavesService.findById(id);
  }

  @Post()
  async createWave(@Body() createWaveDto: CreateWaveDto): Promise<WaveResponseDto> {
    return await this.wavesService.create(createWaveDto);
  }

  @Post(':id/like')
  async changeLike(@Body('islike') isLike: boolean, @Param('id', ParseIntPipe) id: number) {
    if (isLike === undefined) return {
      message: "Укажите действие",
      status: 'failed'
    };

    this.wavesService.changeLike(id, isLike);

    return {
      message: "Лайк поменян",
      status: 'success'
    };
  }

  @Post(':id/image')
  @UseInterceptors(
    FileInterceptor('image', {storage: memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(
            new BadRequestException('Поддерживаются только изображения (jpg, jpeg, png, gif)'),
            false,
          );
        }
        callback(null, true);
      },
    })
  )
  async uploadImage(@Param('id', ParseIntPipe) id: number, @UploadedFile() image: Express.Multer.File) {
    return this.wavesService.uploadImage(id, image);
  }

  @Post(':id/video')
  @UseInterceptors(
    FileInterceptor('video', {storage: memoryStorage(), limits: { fileSize: 80 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(mp4)$/)) {
          return callback(
            new BadRequestException('Поддерживаются только видео (mp4)'),
            false,
          );
        }
        callback(null, true);
      },
    })
  )
  async uploadVideo(@Param('id', ParseIntPipe) id: number, @UploadedFile() video: Express.Multer.File) {
    return this.wavesService.uploadVideo(id, video);
  }

  @Put('draft/publish')
  async publishWave() {
    await this.wavesService.publishDraft();
    return {
      message: "Черновик успешно опубликован",
      status: 'success',
      timestamp: new Date().toISOString()
    };
  }

  @Delete(':id')
  async deleteWave(@Param('id', ParseIntPipe) id: number) {
    await this.wavesService.remove(id);
    return {
      message: `Диапазон с ID ${id} успешно удален`,
      status: 'success',
      timestamp: new Date().toISOString()
    };
  }
}

@Controller('user')
export class UsersController {
  constructor(private readonly wavesService: WavesService) {}

  @Post('register')
  async registerUser(@Body() registerUserDto: RegisterUserDto): Promise<void> {
    await this.wavesService.registerUser(registerUserDto);
  }

  @Post('auth')
  async initiateAuth(@Body() registerUserDto: RegisterUserDto): Promise<boolean> {
    return true;
  }

  @Post('deauth')
  async initiateDeauth(): Promise<boolean> {
    return true;
  }
}