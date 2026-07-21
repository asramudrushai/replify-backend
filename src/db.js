const path = require('path');
const Database = require('better-sqlite3');

// Real SQLite database file (replaces the team-db CLI from cto.new)
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'replify.db');
const db = new Database(dbPath);

// Create tables on startup if they don't exist
db.exec(`
CREATE TABLE IF NOT EXISTS businesses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT UNIQUE,
  password_hash TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS faqs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER,
  question TEXT,
  answer TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS chat_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER,
  widget_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER,
  name TEXT,
  email TEXT,
  chat_session_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

// Seed demo business (ID 1) with sample FAQs so the demo always works
const businessCount = db.prepare('SELECT COUNT(*) AS c FROM businesses').get().c;
if (businessCount === 0) {
  db.prepare("INSERT INTO businesses (id, name, email, password_hash) VALUES (1, 'Replify Demo Business', 'demo@replify.uk', '')").run();
}
const faqCount = db.prepare('SELECT COUNT(*) AS c FROM faqs WHERE business_id = 1').get().c;
if (faqCount === 0) {
  const insertFaq = db.prepare('INSERT INTO faqs (business_id, question, answer) VALUES (1, ?, ?)');
  insertFaq.run('What are your opening hours?', 'We are open Monday to Friday 9am to 5pm, and Saturday 10am to 2pm. Closed Sundays.');
  insertFaq.run('What services do you offer?', 'We offer AI-powered customer service chatbots for small businesses, including setup, FAQ training, and ongoing support.');
  insertFaq.run('How much does it cost? What are your prices?', 'Replify costs 200 pounds per month plus a 495 pound one-off setup fee, with a free 30-day trial. Half-price setup for our first 3 founding clients!');
  insertFaq.run('Where are you located? What is your address?', 'We are based in Derby, UK, and work with local small businesses across the area.');
  insertFaq.run('How do I contact you? What is your phone number or email?', 'You can reach us at hello.replify.uk@gmail.com and we will get back to you within one working day.');
}

// Seed Stable View cafe (ID 2) with FAQs from their public info — pre-built sales demo
const svCount = db.prepare('SELECT COUNT(*) AS c FROM businesses WHERE id = 2').get().c;
if (svCount === 0) {
  db.prepare("INSERT INTO businesses (id, name, email, password_hash) VALUES (2, 'Stable View', 'stableviewinfo@gmail.com', '')").run();
}
const svFaqCount = db.prepare('SELECT COUNT(*) AS c FROM faqs WHERE business_id = 2').get().c;
if (svFaqCount === 0) {
  const insertSv = db.prepare('INSERT INTO faqs (business_id, question, answer) VALUES (2, ?, ?)');
  insertSv.run('What are your opening hours? When are you open?', 'We are open Monday to Friday 9.30am to 4pm, and weekends 10am to 3pm.');
  insertSv.run('Are you dog friendly? Can I bring my dog?', 'Dogs are very welcome in our outdoor seating areas - the wooden pagoda or the picnic benches by the stables - and we even have a doggy menu! Unfortunately dogs are not allowed inside the cafe itself.');
insertSv.run('Do I need to book a table? Can I make a reservation or booking?', 'We operate on a first come first served basis. Bookings are only needed for special occasions, groups of more than 4 people, or afternoon tea - pop your name and email below and leave your details, and the team will get straight back to you to arrange it.');
  insertSv.run('Where are you located? What is your address? Do you have parking?', 'You will find us at Spondon Road, Ilkeston DE7 4PQ - a lovely spot by the stables, surrounded by great local walks.');
  insertSv.run('What food do you serve? Do you do breakfast, lunch or vegetarian options?', 'We serve coffee, cake, breakfast, brunch and lunch, including our famous Stable Breakfast. Our seasonal menu uses the freshest ingredients and includes vegetarian options.');
  insertSv.run('How do I contact you? What is your phone number or email?', 'You can call us on 01332 677373 or email stableviewinfo@gmail.com on weekdays.');
 insertSv.run('Do you do events, parties or afternoon tea?', 'Yes! Our afternoon tea is 23.95 pounds per person and we host events too. Pop your name and email below and leave your details - the team will get straight back to you to arrange it.');
  insertSv.run('Do you serve drinks, ice cream or hot chocolate?', 'Yes - alongside great coffee we do Baileys hot chocolate, and in summer our Horse Box bar serves hot and cold drinks including local Bluebells ice cream.');
}

/**
 * Executes a SQL statement against the local SQLite database.
 * SELECT statements return an array of rows; other statements return an empty array.
 */
function query(sql) {
  try {
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      return db.prepare(sql).all();
    }
    db.prepare(sql).run();
    return [];
  } catch (error) {
    console.error('Database query error:', error.message);
    console.error('SQL:', sql);
    throw error;
  }
}

module.exports = { query };
