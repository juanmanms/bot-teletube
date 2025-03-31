import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // Asegúrate de que apunte al archivo correcto
    }),
  ],
})
export class AppModule {}
