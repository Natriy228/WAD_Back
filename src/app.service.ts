import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private waveCards = [
      { id: 1, status:"OK", name: '1', desc: '1d', img: "lox.jpg", video: "", likes: 0 },
      { id: 2, status:"OK", name: '2', desc: '2d', img: "lox.jpg", video: "", likes: 0 },
      { id: 3, status:"OK", name: '3', desc: '3d', img: "lox.jpg", video: "", likes: 0 },
      { id: 4, status:"OK", name: '4', desc: '4d', img: "lox.jpg", video: "", likes: 0 },
      { id: 5, status:"draft", name: '5', desc: '5d', img: "lox.jpg", video: "", likes: 0 }
  ];


  findAll() {
    return this.waveCards.filter(card => card.status === "OK");
  }

  findByID(requiredID: number) {
    return this.waveCards.find(card => card.id === requiredID );
  }

  findRedacting() {
    return this.waveCards.find(card => card.status === "draft" );
  }
}
