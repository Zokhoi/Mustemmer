import { Entity, PrimaryColumn, Column, JoinColumn, ManyToOne } from "typeorm";
import { randomBytes } from "crypto";
import { User } from ".";

@Entity()
export class Session {
  constructor(params?: { user: User; id?: string; userAgent: string }) {
    if (params) {
      this.id = params.id ?? randomBytes(16).toString("hex");
      this.user = params.user;
      this.userId = params.user.id;
      this.userAgent = params.userAgent;
    }
  }

  @PrimaryColumn()
  id: string;

  @ManyToOne(() => User, (user) => user.activeSessions)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column()
  userId: string;

  @Column()
  userAgent: string;

  @Column({ nullable: true })
  expire: Date;
}
