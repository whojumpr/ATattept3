import { createHashedPassword } from './auth';

async function generateDemo() {
  const plainPassword = 'demo';
  const hashedPassword = await createHashedPassword(plainPassword);
  console.log(`Password '${plainPassword}' hashed as: ${hashedPassword}`);
}

generateDemo().catch(console.error);