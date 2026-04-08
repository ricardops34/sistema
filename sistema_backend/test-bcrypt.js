const bcrypt = require('bcrypt');
async function test() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('test', salt);
    console.log('Result:', hash);
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
