import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { createHash, randomBytes } from "crypto";
import { Session } from ".";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  salt: string;

  @Column()
  hashedPassword: string;

  @Column({ nullable: true })
  token: string;

  @OneToMany(() => Session, (session) => session.user)
  activeSessions: Session[];

  checkPW(password: string) {
    let hash = createHash("sha512")
      .update(password)
      .update(this.salt)
      .digest("base64");
    return hash === this.hashedPassword;
  }

  static from(params: { username: string; password: string }) {
    let user = new User();
    let salt = randomBytes(32).toString("base64");
    let hash = createHash("sha512")
      .update(params.password)
      .update(salt)
      .digest("base64");
    user.username = params.username;
    user.salt = salt;
    user.hashedPassword = hash;
    return user;
  }
}
