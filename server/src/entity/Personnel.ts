import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { Song } from ".";

@Entity()
export class Personnel {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Song, (song) => song.personnel)
  @JoinColumn({ name: "songId" })
  song: Song;

  @Column()
  songId: number;

  @Column()
  name: string;

  @Column("text", { array: true, nullable: true })
  role: string[];

  static from(params: { song: Song; name: string; role?: string[] }) {
    let personnel = new Personnel();
    personnel.song = params.song;
    personnel.songId = params.song.id;
    personnel.name = params.name;
    if (params.role) {
      personnel.role = params.role;
    }
    return personnel;
  }
}
