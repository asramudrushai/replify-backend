const { execSync } = require('child_process');

/**
 * Executes a SQL statement using the team-db CLI.
 * @param {string} sql - The SQL statement to execute.
 * @returns {Array|Object} - The parsed JSON output from team-db.
 */
function query(sql) {
  try {
    // Escape single quotes in the SQL for the shell command
    const escapedSql = sql.replace(/'/g, "'\\''");
    const result = execSync(`team-db '${escapedSql}'`, { encoding: 'utf8' });
    return JSON.parse(result);
  } catch (error) {
    console.error('Database query error:', error.message);
    console.error('SQL:', sql);
    throw error;
  }
}

module.exports = { query };
