import { Injectable } from '@nestjs/common';

@Injectable()
export class WavesService {
  private waveCards = [
      { id: 1, status:"OK", name: "Радио", desc: "Излучение диапазона радиоволн", lowWave: 0.00003, highWave: 300, effClass: 0, img: "http://localhost:9000/media/radioImage.png", video: "http://localhost:9000/media/radioVideo.mp4", likes: 405 },
      { id: 2, status:"OK", name: "ИК", desc: "Инфракрасное излучение", lowWave: 300, highWave: 400000, effClass: 1, img: "http://localhost:9000/media/URImage.png", video: "http://localhost:9000/media/URVideo.mp4", likes: 1009 },
      { id: 3, status:"OK", name: "Видимый свет", desc: "Излучение видимого света", lowWave: 400000, highWave: 750000, effClass: 5, img: "http://localhost:9000/media/VLImage.png", video: "http://localhost:9000/media/VLVideo.mp4", likes: 36769 },
      { id: 4, status:"OK", name: "УФ", desc: "Ультрафиолетовое излучение", lowWave: 750000, highWave: 1000000, effClass: 4, img: "http://localhost:9000/media/UVImage.png", video: "http://localhost:9000/media/UVVideo.mp4", likes: 707 },
      { id: 5, status:"draft", name: "Рентген", desc: "Рентгеновское излучение", lowWave: 1000000, highWave: 50000000, effClass: 2, img: "http://localhost:9000/media/gammaImage.png", video: "http://localhost:9000/media/gammaVideo.mp4", likes: 0 },
      { id: 6, status:"del", name: "Короткие волны", desc: "Те, что в высоковольтных проводах", lowWave: 0.00001, highWave: 0.00003, effClass: -1, img: "", video: "", likes: 0 }
  ];


  findAll() {
    return this.waveCards.filter(card => card.status === "OK");
  }

  findByID(requiredID: number) {
    return this.waveCards.find(card => (card.id === requiredID && card.status === "OK"));
  }

  findByWave(requireWave: number) {
    return this.waveCards.filter(card => ((requireWave >= card.lowWave && requireWave < card.highWave) && card.status === "OK"));
  }

  findRedacting() {
    let curWave = this.waveCards.find(card => card.status === "draft");
    if (curWave == undefined) {
      let newID = -1;
      for (let i = 0; i < this.waveCards.length; ++i) {
        newID = Math.max(newID, this.waveCards[i].id);
      }
      newID++;
      this.waveCards.push({ id: newID, status:"draft", name: "", desc: "", lowWave: 0, highWave: 0, effClass: 0, img: "", video: "", likes: 0 });
    }
    else {
      return curWave;
    }
    return this.waveCards[this.waveCards.length - 1];
  }
}
