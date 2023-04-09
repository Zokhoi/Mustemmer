import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { createHash, randomBytes } from "crypto";
import { Session, User } from ".";


@Entity()
export class Invite {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(()=> User, user => user.invites)
  owner: User;

  @Column()
  code: string;

  @Column({ nullable: true })
  expireDate: Date;

  @Column()
  expired: boolean;

  @Column()
  usesRemain: number;

  static from(params: {user: User, usesRemain?: number, expireDate?: Date}) {
    let invite = new Invite;
    invite.owner = params.user;
    let salt = randomBytes(32).toString("base64");
    let expireDate = params.expireDate ?? new Date(Date.now() + 1000 * 3600 * 24 * 7); // default to one week
    let hash = createHash("sha512")
      .update(salt)
      .update(expireDate.toString())
      .digest("base64");
    invite.code = hash.substring(0, 8);
    invite.usesRemain = params.usesRemain ?? 1;
    invite.expireDate = expireDate;
    invite.expired = false;
    return invite;
  }
}