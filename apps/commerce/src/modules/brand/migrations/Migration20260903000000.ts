import { Migration } from "@medusajs/framework/mikro-orm/migrations";

/**
 * Commerce-owned brand table. The handle is the stable seed/business key;
 * keeping it in the commerce database avoids putting catalogue identity in
 * the CMS or search index.
 */
export class Migration20260903000000 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "brand" ("id" text not null, "name" text not null, "handle" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "brand_pkey" primary key ("id"));',
    );
    this.addSql(
      'create unique index if not exists "brand_handle_unique" on "brand" ("handle") where "deleted_at" is null;',
    );
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "brand" cascade;');
  }
}

