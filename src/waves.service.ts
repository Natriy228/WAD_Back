import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { TypeORMWavesRepository } from './repositories/typeorm-waves.repository';
import { TypeORMLikesRepository } from './repositories/typeorm-likes.repository';
import { TypeORMUsersRepository } from './repositories/typeorm-users.repository';

import { MinioSimpleService } from './minio.service';

import { WaveResponseDto } from './dto/wave-response.dto';
import { CreateWaveDto } from './dto/create-wave.dto';
import { WaveFiltersDto } from './dto/wave-filters.dto';
import { RegisterUserDto } from './dto/user-register.dto';

@Injectable()
export class WavesService {
  constructor(
    private readonly wavesRepository: TypeORMWavesRepository,
    private readonly likesRepository: TypeORMLikesRepository,
    private readonly usersRepository: TypeORMUsersRepository,
    private minioService: MinioSimpleService
  ) {}

  singleton(): number {
    return 1;
  }

  async findAll(filters: WaveFiltersDto): Promise<WaveResponseDto[]> {
    if (filters.includeDeleted === undefined) {
      filters.includeDeleted = false;
    }

    const waves = await this.wavesRepository.findAll(filters);

    const wavesWithSignedUrls = await Promise.all(
      waves.map(async (wave) => {
        if (wave.img) {
          const fileName = wave.img.split('/').pop();
          try {
            const signedUrl = await this.minioService.getSignedUrl(fileName);
            if (signedUrl) wave.img = signedUrl;
            else wave.img = "default";
          } catch (error) {
            console.warn(`Не удалось получить ссылку для файла:`, error);
            wave.img = "default";
          }
        }

        if (wave.video) {
          const fileName = wave.video.split('/').pop();
          try {
            const signedUrl = await this.minioService.getSignedUrl(fileName);
            if (signedUrl) wave.video = signedUrl;
            else wave.video = "default";
          } catch (error) {
            console.warn(`Не удалось получить ссылку для файла:`);
            wave.video = "default"
          }
        }

        const { status, ownedUser, ...waveData } = wave;
        return waveData as WaveResponseDto;
      })
    );

    return wavesWithSignedUrls;
  }

  async findById(id: number): Promise<WaveResponseDto> {
    const wave = await this.wavesRepository.findById(id);

    if (!wave || wave.status === "del" || wave.status === "draft") {
      throw new NotFoundException(`Диапазон с ID ${id} не найден`);
    }

    if (wave.img) {
      const fileName = wave.img.split('/').pop();
      try {
        const signedUrl = await this.minioService.getSignedUrl(fileName);
        if (signedUrl) wave.img = signedUrl;
        else wave.img = "default";
      } catch (error) {
        console.warn(`Не удалось получить ссылку для файла:`);
        wave.img = "default"
      }
    }

    if (wave.video) {
      const fileName = wave.video.split('/').pop();
      try {
        const signedUrl = await this.minioService.getSignedUrl(fileName);
        if (signedUrl) wave.video = signedUrl;
        else wave.video = "default";
      } catch (error) {
        console.warn(`Не удалось получить ссылку для файла:`);
        wave.video = "default"
      }
    }

    const rliked = await this.likesRepository.findLikes(this.singleton(), id);

    const { status, ownedUser, ...waveData } = wave;
    return { ...waveData, liked: (rliked === 1), owner: null } as WaveResponseDto;
  }

  async findDraft(): Promise<WaveResponseDto> {
    const wave = await this.wavesRepository.findDraft(this.singleton());

    if (!wave) {
      throw new NotFoundException("Черновик не найден");
    }

    if (wave.img) {
      const fileName = wave.img.split('/').pop();
      try {
        const signedUrl = await this.minioService.getSignedUrl(fileName);
        if (signedUrl) wave.img = signedUrl;
        else wave.img = "default";
      } catch (error) {
        console.warn(`Не удалось получить ссылку для файла:`);
        wave.img = "default"
      }
    }

    if (wave.video) {
      const fileName = wave.video.split('/').pop();
      try {
        const signedUrl = await this.minioService.getSignedUrl(fileName);
        if (signedUrl) wave.video = signedUrl;
        else wave.video = "default";
      } catch (error) {
        console.warn(`Не удалось получить ссылку для файла:`);
        wave.video = "default"
      }
    }

    const { status, ownedUser, ...waveData } = wave;
    return { ...waveData, liked: null, owner: null } as WaveResponseDto;
  }

  async create(createWaveDto: CreateWaveDto): Promise<WaveResponseDto> {
    const user = await this.usersRepository.findUserById(this.singleton());
    if (!user) {
      throw new NotFoundException("Сначала авторизуйтесь!");
    }
    const wave = await this.wavesRepository.create({ ...createWaveDto, ownedUser: user });
    const { status, ...waveWithoutDeleted } = wave;
    return { ...waveWithoutDeleted, liked: null, owner: null } as WaveResponseDto;
  }

  async publishDraft(): Promise<void> {
    const res = await this.wavesRepository.publishDraft(this.singleton());
    if (!res) {
      throw new NotFoundException("Публиковать нечего");
    }
  }

  async remove(id: number): Promise<void> {
    const wave = await this.wavesRepository.findById(id);

    if (!wave || wave.status === "del") {
      throw new NotFoundException(`Диапазон с ID ${id} не найден`);
    }

    if (wave.ownedUser.id != this.singleton()) {
      throw new BadRequestException("Попытка удалить чужую карточку");
    }

    await this.wavesRepository.softDelete(id);
  }

  async changeLike(id: number, state: boolean): Promise<void> {
    if (state) {
      const aWave = await this.wavesRepository.findById(id);
      const aUser = await this.usersRepository.findUserById(this.singleton());

      if (!aWave || !aUser) {
        throw new BadRequestException("");
      }

      await this.likesRepository.setLike(aUser, aWave);
    }
    else {
      const res = await this.likesRepository.discardLike(this.singleton(), id);
      if (!res) {
        throw new BadRequestException("");
      }
    }
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    await this.usersRepository.register(registerUserDto.nickName, registerUserDto.password);
  }

  async uploadImage(id: number, file: Express.Multer.File): Promise<WaveResponseDto> {
    // Проверяем существование товара
    const wave = await this.wavesRepository.findById(id);
    
    if (!wave || wave.status === "del") {
      throw new NotFoundException(`Диапазон с ID ${id} не найден`);
    }

    // Проверяем файл
    if (!file) {
      throw new BadRequestException('Файл не предоставлен');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Файл должен быть изображением');
    }

    try {
      // Удаляем старое изображение, если оно существует
      if (wave.img) {
        await this.deleteOldImage(wave.img);
      }

      // Загружаем новое изображение в MinIO
      const imageUrl = await this.minioService.uploadProductImage(file.buffer, id);

      // Обновляем запись товара с новым URL изображения
      const updatedWave = await this.wavesRepository.update(id, { img: imageUrl });

      // Генерируем подписанную ссылку для нового изображения
      if (updatedWave.img) {
        const fileName = updatedWave.img.split('/').pop();
        try {
          const signedUrl = await this.minioService.getSignedUrl(fileName);
          if (signedUrl) updatedWave.img = signedUrl;
          else updatedWave.img = "default";
        } catch (error) {
          updatedWave.img = "default";
        }
      }

      const { status, ownedUser, ...waveData } = updatedWave;
      return { ...waveData, "liked": null, owner: null } as WaveResponseDto;
    } catch (error) {
      console.error('Ошибка при загрузке изображения:', error);
      throw new InternalServerErrorException('Не удалось загрузить изображение');
    }
  }

  private async deleteOldImage(imageUrl: string): Promise<void> {
    try {
      // Извлекаем имя файла из URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      // Удаляем файл из MinIO
      await this.minioService.deleteFile(fileName);
    } catch (error) {
      console.warn('Не удалось удалить старое изображение:');
      // Не выбрасываем ошибку, так как это не критично
    }
  }

  async uploadVideo(id: number, file: Express.Multer.File): Promise<WaveResponseDto> {
    // Проверяем существование товара
    const wave = await this.wavesRepository.findById(id);
    
    if (!wave || wave.status === "del") {
      throw new NotFoundException(`Диапазон с ID ${id} не найден`);
    }

    // Проверяем файл
    if (!file) {
      throw new BadRequestException('Файл не предоставлен');
    }

    try {
      if (wave.video) {
        await this.deleteOldVideo(wave.video);
      }

      // Загружаем новое изображение в MinIO
      const videoUrl = await this.minioService.uploadProductImage(file.buffer, id);

      // Обновляем запись товара с новым URL изображения
      const updatedWave = await this.wavesRepository.update(id, { video: videoUrl });

      // Генерируем подписанную ссылку для нового изображения
      if (updatedWave.video) {
        const fileName = updatedWave.video.split('/').pop();
        try {
          const signedUrl = await this.minioService.getSignedUrl(fileName);
          if (signedUrl) updatedWave.video = signedUrl;
          else updatedWave.video = "default";
        } catch (error) {
          updatedWave.video = "default";
        }
      }

      const { status, ownedUser, ...waveData } = updatedWave;
      return { ...waveData, "liked": null, owner: null } as WaveResponseDto;
    } catch (error) {
      console.error('Ошибка при загрузке изображения:', error);
      throw new InternalServerErrorException('Не удалось загрузить изображение');
    }
  }

  private async deleteOldVideo(videoUrl: string): Promise<void> {
    try {
      // Извлекаем имя файла из URL
      const urlParts = videoUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      // Удаляем файл из MinIO
      await this.minioService.deleteFile(fileName);
    } catch (error) {
      console.warn('Не удалось удалить старое изображение:');
      // Не выбрасываем ошибку, так как это не критично
    }
  }
}