import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedOpportunity } from './entities/saved-opportunity.entity';
import { Opportunity } from '../opportunities/entities/opportunity.entity';
import { SavedService } from './saved.service';
import { SavedController } from './saved.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SavedOpportunity, Opportunity])],
  providers: [SavedService],
  controllers: [SavedController],
})
export class SavedModule {}
