import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Personnel } from ".";

@Entity()
export class Song {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  translatedName: string;

  @Column({ nullable: true })
  release: Date;

  @Column()
  variableTempo: boolean = false;

  @Column()
  variableTime: boolean = false;

  @Column({ nullable: true })
  location: string;

  @Column("text", { array: true, nullable: true })
  key: string[];

  @Column("float", { array: true, nullable: true })
  tempo: number[];

  @Column("text", { array: true, default: ["4/4"] })
  time: string[];

  @OneToMany(() => Personnel, (personnel) => personnel.song, { cascade: true })
  personnel: Personnel[];

  static from(params: {
    name: string;
    translatedName: string;
    release?: Date;
    location?: string;
    key?: string[];
    tempo?: number[];
    time?: string[];
    variableTempo?: boolean;
    variableTime?: boolean;
  }) {
    let song = new Song();
    [
      "name",
      "translatedName",
      "release",
      "location",
      "key",
      "tempo",
      "time",
      "variableTempo",
      "variableTime",
    ].forEach((v) => {
      if (params[v] !== undefined) song[v] = params[v];
    });
    return song;
  }

  static serializeSync(song: Song) {
    return {
      id: song.id,
      name: song.name,
      translatedName: song.translatedName,
      personnel: song.personnel?.map((v) => {
        return { name: v.name, role: v.role };
      }),
      release: song.release?.toUTCString(),
      key: song.key,
      tempo: song.tempo,
      time: song.time,
      variableTempo: song.variableTempo,
      variableTime: song.variableTime,
      location: song.location,
    };
  }
}
