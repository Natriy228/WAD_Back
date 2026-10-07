export class WaveResponseDto {
  id: number;
  name: string;
  desc: string | null;
  lowWave: number;
  highWave: number;
  img: string;
  video: string;
  liked: boolean | null;
  owner: boolean | null;
}
