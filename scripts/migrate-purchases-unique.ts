import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  // Remove duplicate purchases rows before adding the constraint (keep the one with the lowest id)
  await pool.query(`
    DELETE FROM purchases
    WHERE id NOT IN (
      SELECT DISTINCT ON (jr_no, jr_item_no) id
      FROM purchases
      WHERE jr_no IS NOT NULL AND jr_item_no IS NOT NULL
      ORDER BY jr_no, jr_item_no, id
    )
    AND jr_no IS NOT NULL
    AND jr_item_no IS NOT NULL;
  `);

  await pool.query(`
    ALTER TABLE purchases
      ADD CONSTRAINT purchases_jr_no_jr_item_no_key UNIQUE (jr_no, jr_item_no);
  `);

  console.log("Migration complete: added UNIQUE (jr_no, jr_item_no) to purchases");
  await pool.end();
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
