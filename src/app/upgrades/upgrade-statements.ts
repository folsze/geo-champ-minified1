export const mapModeLocationVersionUpgrades = [
  {
    toVersion: 1,
    statements: [
      `CREATE TABLE IF NOT EXISTS map (
          id integer PRIMARY KEY AUTOINCREMENT NOT NULL
        );`,
      `CREATE TABLE IF NOT EXISTS mode (
          id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
          FOREIGN KEY (mapId) REFERENCES map (id)
        );`,
    ]
  },
]

// TODO FOR LATER:
/*

      // `CREATE TABLE IF NOT EXISTS location (
      //     id integer PRIMARY KEY NOT NULL,
      //     FOREIGN KEY (mapId) REFERENCES map (id)
      //     FOREIGN KEY (modeId) REFERENCES mode (id)
      //   );`,

          name varchar(64) NOT NULL,

          type Integer(64) NOT NULL,
          https://stackoverflow.com/a/17203007/20009330

          name varchar(64) NOT NULL,
          progress INTEGER NOT NULL,


query random location:
          SELECT *
FROM Location
WHERE
  Location.id != ?
  AND Location.Map_id = ?
  AND Location.Mode_id = ?
ORDER BY
  CASE WHEN Location.progress < 7 THEN 1 ELSE 0 END DESC,
  RAND()
LIMIT 1;


UPDATE Location
SET progress = ?
WHERE id = ?
AND Map_id = ?
AND Mode_id = ?;
 */

