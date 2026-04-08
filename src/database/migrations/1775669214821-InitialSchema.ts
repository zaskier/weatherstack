import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1775669214821 implements MigrationInterface {
    name = 'InitialSchema1775669214821'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "property" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "city" character varying NOT NULL, "street" character varying NOT NULL, "state" character varying NOT NULL, "zipCode" character varying NOT NULL, "weather" jsonb, "lat" numeric(10,7), "long" numeric(10,7), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_property_id" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "property"`);
    }

}
