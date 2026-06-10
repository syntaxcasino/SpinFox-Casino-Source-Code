import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('chain_state')
export class ChainState {
  @PrimaryColumn()
  chain: string; // e.g. 'ethereum'

  @Column({ type: 'int' })
  lastProcessedBlock: number;
}
