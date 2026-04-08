import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexesToProperty1775669388244 implements MigrationInterface {
    name = 'AddIndexesToProperty1775669388244'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_41d8355ab0c9b233a750c29c39" ON "property" ("state") `);
        await queryRunner.query(`CREATE INDEX "IDX_e39804ff02d174973a34ca694c" ON "property" ("createdAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_e39804ff02d174973a34ca694c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_41d8355ab0c9b233a750c29c39"`);
    }

}
