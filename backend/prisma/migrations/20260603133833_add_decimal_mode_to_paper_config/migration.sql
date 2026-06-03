/*
  Warnings:

  - You are about to alter the column `result_max_value` on the `paper_configs` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to alter the column `result_min_value` on the `paper_configs` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.

*/
-- CreateTable
CREATE TABLE "paper_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "child_id" TEXT NOT NULL,
    "config_snapshot" TEXT NOT NULL,
    "questions" TEXT NOT NULL,
    "generated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',
    CONSTRAINT "paper_records_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_paper_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "practice_config_id" TEXT NOT NULL,
    "config_name" TEXT NOT NULL,
    "step" INTEGER NOT NULL,
    "formula_list" TEXT NOT NULL,
    "result_min_value" REAL NOT NULL,
    "result_max_value" REAL NOT NULL,
    "number_of_formulas" INTEGER NOT NULL,
    "where_is_result" INTEGER NOT NULL DEFAULT 0,
    "enable_brackets" BOOLEAN NOT NULL DEFAULT false,
    "carry" INTEGER NOT NULL DEFAULT 1,
    "abdication" INTEGER NOT NULL DEFAULT 1,
    "remainder" INTEGER NOT NULL DEFAULT 1,
    "solution" INTEGER NOT NULL DEFAULT 0,
    "number_mode" TEXT NOT NULL DEFAULT 'integer',
    "decimal_places" INTEGER,
    "number_of_papers" INTEGER NOT NULL DEFAULT 1,
    "number_of_pager_columns" INTEGER NOT NULL DEFAULT 3,
    "paper_title" TEXT NOT NULL DEFAULT '小学生口算题',
    "paper_sub_title" TEXT NOT NULL DEFAULT '姓名：__________ 日期：____月____日 时间：________ 对题：____道',
    "file_name_generated_rule" TEXT NOT NULL DEFAULT 'title',
    "generate_mode" INTEGER NOT NULL DEFAULT 1,
    "custom_formula_list" TEXT,
    "paper_list_data" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "paper_configs_practice_config_id_fkey" FOREIGN KEY ("practice_config_id") REFERENCES "practice_configs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_paper_configs" ("abdication", "carry", "config_name", "created_at", "enable_brackets", "formula_list", "id", "is_active", "number_of_formulas", "practice_config_id", "remainder", "result_max_value", "result_min_value", "solution", "step", "updated_at", "where_is_result") SELECT "abdication", "carry", "config_name", "created_at", "enable_brackets", "formula_list", "id", "is_active", "number_of_formulas", "practice_config_id", "remainder", "result_max_value", "result_min_value", "solution", "step", "updated_at", "where_is_result" FROM "paper_configs";
DROP TABLE "paper_configs";
ALTER TABLE "new_paper_configs" RENAME TO "paper_configs";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
